const { sequelize } = require('../config/database');
const Transaction = require('../models/Transaction');
const ReconciliationMatch = require('../models/ReconciliationMatch');
const { Op } = require('sequelize');

class ReconciliationService {

  static async performReconciliation(jobId) {
    const transaction = await sequelize.transaction();
    let matchCount = 0;
    
    try {
      // 1. Fetch all pending transactions for this Job
      const bankTransactions = await Transaction.findAll({
        where: { jobId, sourceType: 'bank', status: 'pending' },
        transaction
      });

      const erpTransactions = await Transaction.findAll({
        where: { jobId, sourceType: 'erp', status: 'pending' },
        transaction
      });

      // OPTIMIZATION: Hash Map by Absolute Value
      const erpMap = new Map();
      erpTransactions.forEach(tx => {
        const amountKey = Math.abs(parseFloat(tx.amount)).toFixed(2);
        if (!erpMap.has(amountKey)) erpMap.set(amountKey, []);
        erpMap.get(amountKey).push(tx);
      });

      const matchesToCreate = [];
      const usedErpIds = new Set();
      const transactionsToUpdate = new Set();

      // 2. Matching Loop
      for (const bankTx of bankTransactions) {
        const amountKey = Math.abs(parseFloat(bankTx.amount)).toFixed(2);
        const candidates = erpMap.get(amountKey) || [];

        let bestCandidate = null;
        let bestScore = 0;

        for (const erpTx of candidates) {
          if (usedErpIds.has(erpTx.id)) continue;

          const score = this.calculateScore(bankTx, erpTx);

          if (score > bestScore) {
            bestScore = score;
            bestCandidate = erpTx;
          }
        }

        // 3. Confidence Classification
        if (bestCandidate && bestScore >= 0.6) {
          const matchType = bestScore >= 0.85 ? 'automatic' : 'suggested';
          const isConfirmed = matchType === 'automatic';
          
          matchesToCreate.push({
            jobId,
            bankTransactionId: bankTx.id,
            erpTransactionId: bestCandidate.id,
            confidenceScore: bestScore,
            matchType,
            status: isConfirmed ? 'confirmed' : 'pending',
            explanation: `Score: ${bestScore.toFixed(2)}. Valor exato.`
          });

          usedErpIds.add(bestCandidate.id);
          
          if (isConfirmed) {
             bankTx.status = 'matched';
             bestCandidate.status = 'matched';
             transactionsToUpdate.add(bankTx.id);
             transactionsToUpdate.add(bestCandidate.id);
          }
          matchCount++;
        }
      }

      // 4. Bulk Updates and Creates
      if (matchesToCreate.length > 0) {
        await ReconciliationMatch.bulkCreate(matchesToCreate, { transaction });
      }

      if (transactionsToUpdate.size > 0) {
        await Transaction.update(
          { status: 'matched' },
          { 
            where: { id: { [Op.in]: Array.from(transactionsToUpdate) } },
            transaction 
          }
        );
      }

      await transaction.commit();
      return { matchesFound: matchCount, processedBank: bankTransactions.length };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static calculateScore(bankTx, erpTx) {
    let score = 0;

    // 1. Value Filter (Strict: Difference < 0.01)
    const diff = Math.abs(parseFloat(bankTx.amount) - parseFloat(erpTx.amount));
    if (diff > 0.01) return 0;
    
    score += 0.7; // Base score for equal value

    // 2. Date Window (3 days)
    const date1 = new Date(bankTx.date);
    const date2 = new Date(erpTx.date);
    const dayDiff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
    
    if (dayDiff <= 3) {
      score += 0.1;
    }

    // 3. Text Similarity (Jaccard)
    const similarity = this.jaccardSimilarity(bankTx.description || '', erpTx.description || '');
    score += (similarity * 0.2);

    return parseFloat(score.toFixed(2));
  }

  static jaccardSimilarity(str1, str2) {
    const s1 = new Set(str1.toLowerCase().split(/\s+/));
    const s2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  }
}

module.exports = ReconciliationService;
