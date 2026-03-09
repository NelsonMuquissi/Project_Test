import { Chart } from 'chart.js/auto';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  CheckCircle2,
  Clock,
  Handshake,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  History,
  Plus,
  Building2
} from 'lucide-react';
import API_URL from '../config/apiConfig';
import DashboardLayout from './DashboardLayout';
import ImmersiveBackground from '../components/dashboard/ImmersiveBackground';

function DashboardPage({ onLogout }) {
  const [kpis, setKpis] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingTransactions: 0,
    matchRate: 0,
    totalMatches: 0,
    confirmedMatches: 0
  });
  const [bankStats, setBankStats] = useState([]);
  const [efficiencyTrend, setEfficiencyTrend] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('30');

  const lineChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const lineChartInstance = useRef(null);
  const doughnutChartInstance = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || 'Usuário';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboardData();
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const compRes = await fetch(`${API_URL}/companies/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const companies = await compRes.json();

      if (companies && companies.length > 0) {
        const companyId = companies[0].id;

        const kpiRes = await fetch(`${API_URL}/companies/${companyId}/reports/kpis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const kpiData = await kpiRes.json();
        if (kpiData.kpis) setKpis(kpiData.kpis);
        if (kpiData.bankStats) setBankStats(kpiData.bankStats);
        if (kpiData.efficiencyTrend) setEfficiencyTrend(kpiData.efficiencyTrend);

        const jobsRes = await fetch(`${API_URL}/companies/${companyId}/reconciliation-jobs?pageSize=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const jobsData = await jobsRes.json();
        setRecentJobs(jobsData.rows || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    const ctxLine = lineChartRef.current?.getContext('2d');
    const ctxDoughnut = doughnutChartRef.current?.getContext('2d');

    if (lineChartInstance.current) lineChartInstance.current.destroy();
    if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();

    if (ctxLine) {
      lineChartInstance.current = new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: efficiencyTrend.length > 0
            ? efficiencyTrend.map(t => new Date(t.createdAt).toLocaleDateString('pt-PT'))
            : recentJobs.map(j => new Date(j.createdAt).toLocaleDateString('pt-PT')).reverse(),
          datasets: [{
            label: 'Eficiência (Matches)',
            data: efficiencyTrend.length > 0
              ? efficiencyTrend.map(t => t.matchCount)
              : recentJobs.map(j => j.matchCount || 0).reverse(),
            borderColor: '#0071e3',
            backgroundColor: 'rgba(0, 113, 227, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    if (ctxDoughnut) {
      const labels = bankStats.length > 0 ? bankStats.map(b => b.name) : ['Concluídos', 'Pendentes'];
      const data = bankStats.length > 0 ? bankStats.map(b => b.count) : [kpis.completedJobs, kpis.totalJobs - kpis.completedJobs];

      doughnutChartInstance.current = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: ['#0071e3', '#34c759', '#ff9f0a', '#af52de', '#e5e5ea'],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: { legend: { display: false } }
        }
      });
    }

    return () => {
      if (lineChartInstance.current) lineChartInstance.current.destroy();
      if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
    };
  }, [loading, kpis, recentJobs, bankStats, efficiencyTrend]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <ImmersiveBackground />

      <motion.div
        className="dashboard-header-modern"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="welcome-badge">
            <Zap size={14} className="mr-1" />
            <span>Sistemas Operativos</span>
          </div>
          <h1>Olá, {userName.split(' ')[0]}</h1>
          <p>Eis o resumo de performance estratégica da sua empresa.</p>
        </div>
        <div className="header-actions">
          <Link to={recentJobs.length > 0 ? `/bank-accounts/${recentJobs[0].companyId}` : "/minhas-empresas"} className="glass-btn secondary">
            <Building2 size={18} className="mr-2" /> Gerir Contas
          </Link>
          <Link to="/reconciliation" className="glass-btn primary apple-shadow">
            <Plus size={18} className="mr-2" /> Nova Reconciliação
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="stats-grid-modern"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {[
          { label: 'Total de Jobs', value: kpis.totalJobs, icon: <Activity className="text-blue" />, trend: '+12%' },
          { label: 'Taxa de Sucesso', value: `${kpis.matchRate}%`, icon: <CheckCircle2 className="text-green" />, trend: 'Estável' },
          { label: 'Pendentes', value: kpis.pendingTransactions, icon: <Clock className="text-orange" />, trend: '-5%' },
          { label: 'Matches', value: kpis.confirmedMatches, icon: <Handshake className="text-purple" />, trend: '+20%' }
        ].map((stat, idx) => (
          <motion.div key={idx} className="stat-card-modern glass-card" variants={itemVariants} whileHover={{ y: -5 }}>
            <div className="stat-card-header">
              <div className="stat-icon-wrapper">{stat.icon}</div>
              <span className="stat-trend">{stat.trend}</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-value-modern">{stat.value}</span>
              <span className="stat-label-modern">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="dashboard-main-grid-modern">
        <motion.section
          className="main-section glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="section-header-modern">
            <div className="header-title">
              <TrendingUp size={20} className="mr-2 text-blue" />
              <h2>Atividade Recente</h2>
            </div>
            <div className="header-controls">
              <select value={chartPeriod} onChange={e => setChartPeriod(e.target.value)} className="glass-select">
                <option value="7">7 dias</option>
                <option value="30">30 dias</option>
              </select>
            </div>
          </div>
          <div className="chart-container-modern">
            <canvas ref={lineChartRef}></canvas>
          </div>
        </motion.section>

        <motion.section
          className="side-section glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="section-header-modern">
            <div className="header-title">
              <PieChartIcon size={20} className="mr-2 text-purple" />
              <h2>Distribuição por Banco</h2>
            </div>
          </div>
          <div className="chart-container-circle">
            <canvas ref={doughnutChartRef}></canvas>
          </div>
          <div className="modern-legend">
            {bankStats.length > 0 ? bankStats.map((b, i) => (
              <div key={i} className="legend-item">
                <span className={`legend-dot`} style={{ backgroundColor: ['#0071e3', '#34c759', '#ff9f0a', '#af52de'][i % 4] }}></span>
                <span className="legend-label">{b.name} ({b.count})</span>
              </div>
            )) : (
              <>
                <div className="legend-item">
                  <span className="legend-dot bg-blue"></span>
                  <span className="legend-label">Conciliados ({kpis.completedJobs})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot bg-gray"></span>
                  <span className="legend-label">Pendentes ({kpis.totalJobs - kpis.completedJobs})</span>
                </div>
              </>
            )}
          </div>
        </motion.section>
      </div>

      <motion.section
        className="history-section glass-card mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="section-header-modern">
          <div className="header-title">
            <History size={20} className="mr-2 text-orange" />
            <h2>Histórico de Operações</h2>
          </div>
          <Link to="/reconciliation-history" className="modern-link">Ver Tudo</Link>
        </div>
        <div className="modern-table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>DATA</th>
                <th>ESTADO</th>
                <th>MATCHES</th>
                <th>PROGRESSO</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.length > 0 ? recentJobs.map(job => (
                <tr key={job.id}>
                  <td className="font-mono text-sm">{new Date(job.createdAt).toLocaleDateString('pt-PT')}</td>
                  <td>
                    <div className={`status-modern-pill ${job.status}`}>
                      <div className="status-dot"></div>
                      {job.status === 'completed' ? 'Concluído' : 'Processando'}
                    </div>
                  </td>
                  <td className="font-bold">{job.matchCount || 0}</td>
                  <td>
                    <div className="modern-progress-bar">
                      <div className="progress-fill" style={{ width: job.status === 'completed' ? '100%' : '45%' }}></div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="empty-state">Inicie uma nova reconciliação para ver resultados aqui.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      <style>{`
        :root {
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(255, 255, 255, 0.4);
          --modern-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }

        .dashboard-header-modern { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
        .welcome-badge { display: flex; align-items: center; background: rgba(0, 113, 227, 0.1); color: #0071e3; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; width: fit-content; margin-bottom: 0.8rem; }
        .header-content h1 { font-size: 2.8rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 0.5rem; background: linear-gradient(135deg, #1d1d1f 0%, #434345 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header-content p { color: #86868b; font-size: 1.1rem; }

        .glass-btn { display: inline-flex; align-items: center; padding: 12px 24px; border-radius: 14px; font-weight: 600; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 1px solid var(--glass-border); backdrop-filter: blur(4px); text-decoration: none; }
        .glass-btn.primary { background: #0071e3; color: #fff; box-shadow: 0 10px 20px rgba(0, 113, 227, 0.2); }
        .glass-btn.secondary { background: rgba(255, 255, 255, 0.6); color: #1d1d1f; }
        .glass-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1); }

        .stats-grid-modern { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .glass-card { background: var(--glass-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: 24px; box-shadow: var(--modern-shadow); padding: 1.5rem; }
        
        .stat-card-modern { display: flex; flex-direction: column; gap: 1rem; }
        .stat-card-header { display: flex; justify-content: space-between; align-items: center; }
        .stat-icon-wrapper { padding: 10px; border-radius: 12px; background: rgba(255, 255, 255, 0.8); }
        .stat-trend { font-size: 0.75rem; font-weight: 700; color: #34c759; background: rgba(52, 199, 89, 0.1); padding: 4px 8px; border-radius: 8px; }
        .stat-value-modern { font-size: 2.2rem; font-weight: 800; color: #1d1d1f; }
        .stat-label-modern { font-size: 0.9rem; color: #86868b; font-weight: 500; }

        .dashboard-main-grid-modern { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        .section-header-modern { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header-title { display: flex; align-items: center; }
        .header-title h2 { font-size: 1.25rem; font-weight: 700; color: #1d1d1f; }

        .chart-container-modern { height: 350px; }
        .chart-container-circle { height: 280px; position: relative; }
        
        .modern-legend { display: flex; flex-direction: column; gap: 10px; margin-top: 1.5rem; }
        .legend-item { display: flex; align-items: center; gap: 10px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .legend-label { font-size: 0.85rem; color: #86868b; font-weight: 500; }

        .modern-table-wrapper { overflow-x: auto; }
        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .modern-table th { text-align: left; padding: 12px; font-size: 0.7rem; letter-spacing: 1px; color: #86868b; font-weight: 700; text-transform: uppercase; }
        .modern-table td { padding: 16px 12px; background: rgba(255, 255, 255, 0.4); border-top: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border); }
        .modern-table td:first-child { border-left: 1px solid var(--glass-border); border-radius: 12px 0 0 12px; }
        .modern-table td:last-child { border-right: 1px solid var(--glass-border); border-radius: 0 12px 12px 0; }

        .status-modern-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-modern-pill.completed { background: rgba(52, 199, 89, 1); color: #34c759; }
        .status-modern-pill.completed .status-dot { background: #34c759; box-shadow: 0 0 8px #34c759; width: 6px; height: 6px; border-radius: 50%; }
        
        .modern-progress-bar { width: 100%; height: 6px; background: #e5e5ea; border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; background: #0071e3; border-radius: 3px; }

        .glass-select { background: rgba(255, 255, 255, 0.5); border: 1px solid var(--glass-border); padding: 6px 14px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; color: #1d1d1f; outline: none; }
        .modern-link { color: #0071e3; font-size: 0.9rem; font-weight: 600; text-decoration: none; }
        .bg-blue { background-color: #0071e3; }
        .bg-gray { background-color: #e5e5ea; }
        .empty-state { text-align: center; padding: 2rem; color: #86868b; font-style: italic; }

        @media (max-width: 1200px) {
          .dashboard-main-grid-modern { grid-template-columns: 1fr; }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default DashboardPage;
