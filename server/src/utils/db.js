const numericTypes = new Set([
  'tinyint',
  'smallint',
  'mediumint',
  'int',
  'integer',
  'bigint',
  'decimal',
  'double',
  'float',
  'real',
]);

const normalizeIdentifier = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const stringValue = String(value).trim();
  if (stringValue.length === 0) {
    return null;
  }

  return stringValue;
};

const normalizeValueForColumn = (columnDetails, columnName, value) => {
  if (!columnName) {
    return value;
  }

  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const details = columnDetails?.get?.(columnName);
  if (!details) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return value;
  }

  const dataType = (details.dataType || '').toLowerCase();
  if (numericTypes.has(dataType)) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  const stringValue = String(value).trim();
  if (stringValue.length === 0) {
    return null;
  }

  if (typeof details.maxLength === 'number' && details.maxLength > 0 && stringValue.length > details.maxLength) {
    return stringValue.slice(0, details.maxLength);
  }

  return stringValue;
};

module.exports = {
  normalizeIdentifier,
  normalizeValueForColumn,
};
