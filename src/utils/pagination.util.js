exports.getPagination = (query) => {
  const safeQuery = query || {};
  const page = parseInt(safeQuery.page ?? "1");
  const limit = parseInt(safeQuery.limit ?? "10");
  const offset = (page - 1) * limit;
  
  if (query) {
      delete query.page;
      delete query.limit;
  }

  return { page, limit, offset };
};
