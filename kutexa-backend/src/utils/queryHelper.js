const { Op } = require('sequelize');

/**
 * Parses query parameters for Sequelize findAndCountAll
 * @param {Object} query - The request query object
 * @param {Array} allowedSortFields - Optional list of fields allowed for sorting
 * @returns {Object} Sequelize query options
 */
function parseQueryOptions(query, allowedSortFields = []) {
    const { page, pageSize, sort, ...filters } = query;

    const limit = parseInt(pageSize, 10) || 20;
    const offset = (parseInt(page, 10) - 1) * limit || 0;

    let order = [['createdAt', 'DESC']]; // Default
    if (sort) {
        const [field, direction] = sort.split(',');
        // Basic SQL Injection protection: only allow alphanumeric and underscores for fields
        // and only ASC/DESC for direction.
        const isValidField = /^[a-zA-Z0-9_]+$/.test(field);
        const isValidDirection = ['ASC', 'DESC'].includes(direction?.toUpperCase());
        
        // If allowedSortFields is provided, check against it
        const isAllowedField = allowedSortFields.length === 0 || allowedSortFields.includes(field);

        if (isValidField && isValidDirection && isAllowedField) {
            order = [[field, direction.toUpperCase()]];
        }
    }

    const where = {};
    for (const key in filters) {
        if (Object.prototype.hasOwnProperty.call(filters, key)) {
            const value = filters[key];
            
            // Basic check to prevent prototype pollution or other malicious keys
            if (key === '__proto__' || key === 'constructor') continue;

            if (typeof value === 'string' && value.includes(',')) {
                where[key] = { [Op.in]: value.split(',') };
            } else {
                where[key] = value;
            }
        }
    }

    return {
        limit,
        offset,
        order,
        where
    };
}

module.exports = { parseQueryOptions };
