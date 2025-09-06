function parsePagination(query, defaults = { page: 1, limit: 20 }) {
    const page = Math.max(1, parseInt(query.page || defaults.page, 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || defaults.limit, 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

module.exports = { parsePagination };
