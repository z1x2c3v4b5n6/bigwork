const { tableExists, getTableColumns, query } = require('../database');
const { normalizeIdentifier } = require('./db');

const pickColumn = (columns = new Set(), candidates = []) => {
  for (const candidate of candidates) {
    if (columns.has(candidate)) {
      return candidate;
    }
  }
  return null;
};

let cachedDefaultMajorId = null;
let defaultMajorChecked = false;

const getDefaultMajorId = async () => {
  if (defaultMajorChecked) {
    return cachedDefaultMajorId;
  }

  defaultMajorChecked = true;

  if (!(await tableExists('majors'))) {
    cachedDefaultMajorId = null;
    return cachedDefaultMajorId;
  }

  const columns = await getTableColumns('majors');
  if (columns.size === 0) {
    cachedDefaultMajorId = null;
    return cachedDefaultMajorId;
  }

  const idColumn = pickColumn(columns, ['id', 'major_id', 'majorId']);
  if (!idColumn) {
    cachedDefaultMajorId = null;
    return cachedDefaultMajorId;
  }

  const orderColumn =
    pickColumn(columns, ['sort_order', 'order', 'weight']) ||
    pickColumn(columns, ['updated_at', 'update_time']) ||
    pickColumn(columns, ['created_at', 'create_time']) ||
    idColumn;

  const rows = await query(
    `SELECT m.\`${idColumn}\` AS id FROM majors m ORDER BY m.\`${orderColumn}\` ASC LIMIT 1`,
  );

  const normalized = normalizeIdentifier(rows[0]?.id);
  cachedDefaultMajorId = normalized;
  return cachedDefaultMajorId;
};

const resetDefaultMajorCache = () => {
  cachedDefaultMajorId = null;
  defaultMajorChecked = false;
};

module.exports = {
  getDefaultMajorId,
  resetDefaultMajorCache,
};
