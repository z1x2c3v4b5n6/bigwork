const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

const envCandidates = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
];

let envLoaded = false;

for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    const result = dotenv.config({ path: candidate, override: false });
    if (!result.error) {
      envLoaded = true;
    }
  }
}

if (!envLoaded) {
  dotenv.config();
}

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'kaoyan_platform',
  DB_CONNECTION_LIMIT = 10,
} = process.env;

if (!envLoaded) {
  console.warn('[database] 未检测到 server/.env 配置文件，已尝试读取进程环境变量。');
}

if (!DB_PASSWORD) {
  console.warn('[database] 当前未设置 DB_PASSWORD，将以空密码尝试连接 MySQL。');
}

if (!DB_NAME) {
  console.warn('[database] 未指定数据库名称，建议在 .env 中设置 DB_NAME=kaoyan_platform。');
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(DB_CONNECTION_LIMIT) || 10,
  namedPlaceholders: true,
  timezone: 'local',
});

const query = async (sql, params = {}) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const transactional = async (handler) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const tableColumnCache = new Map();

const getTableColumns = async (table) => {
  if (!table) {
    return new Set();
  }

  if (tableColumnCache.has(table)) {
    return tableColumnCache.get(table);
  }

  try {
    const rows = await query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :schema AND TABLE_NAME = :table`,
      { schema: DB_NAME, table },
    );

    const columnSet = new Set(rows.map((row) => row.COLUMN_NAME || row.column_name));
    tableColumnCache.set(table, columnSet);
    return columnSet;
  } catch (error) {
    console.warn(`读取数据表 ${table} 结构失败：${error.message}`);
    const emptySet = new Set();
    tableColumnCache.set(table, emptySet);
    return emptySet;
  }
};

const clearTableColumnCache = () => {
  tableColumnCache.clear();
};

const tableExists = async (table) => {
  const columns = await getTableColumns(table);
  return columns.size > 0;
};

const buildInsertStatement = (table, payload, columns) => {
  const filteredEntries = Object.entries(payload || {}).filter(
    ([key, value]) => value !== undefined && columns.has(key),
  );

  const columnFragments = [];
  const valueFragments = [];
  const params = {};

  filteredEntries.forEach(([key, value]) => {
    columnFragments.push(`\`${key}\``);
    valueFragments.push(`:${key}`);
    params[key] = value;
  });

  if (columns.has('created_at') && !('created_at' in payload)) {
    columnFragments.push('`created_at`');
    valueFragments.push('NOW()');
  }

  if (columns.has('updated_at') && !('updated_at' in payload)) {
    columnFragments.push('`updated_at`');
    valueFragments.push('NOW()');
  }

  if (columnFragments.length === 0) {
    throw new Error(`数据表 ${table} 缺少可写字段，请确认列名是否与 README 中一致`);
  }

  const sql = `INSERT INTO \`${table}\` (${columnFragments.join(', ')}) VALUES (${valueFragments.join(', ')})`;
  return { sql, params };
};

const insertRecord = async (table, payload = {}) => {
  const columns = await getTableColumns(table);

  if (columns.size === 0) {
    throw new Error(`数据表 ${table} 不存在或当前账号无访问权限`);
  }

  const { sql, params } = buildInsertStatement(table, payload, columns);
  return query(sql, params);
};

const updateRecord = async (table, identifier, payload = {}, options = {}) => {
  const columns = await getTableColumns(table);

  if (columns.size === 0) {
    throw new Error(`数据表 ${table} 不存在或当前账号无访问权限`);
  }

  const entries = Object.entries(payload).filter(([key, value]) => value !== undefined && columns.has(key));
  const idColumn = options.idColumn || 'id';

  const setFragments = entries.map(([key]) => `\`${key}\` = :${key}`);
  const params = Object.fromEntries(entries);

  if (columns.has('updated_at') && !('updated_at' in payload)) {
    setFragments.push('`updated_at` = NOW()');
  }

  if (setFragments.length === 0) {
    return { affectedRows: 0 };
  }

  params.id = identifier;

  const sql = `UPDATE \`${table}\` SET ${setFragments.join(', ')} WHERE \`${idColumn}\` = :id LIMIT 1`;
  return query(sql, params);
};

const deleteRecord = async (table, identifier, options = {}) => {
  const columns = await getTableColumns(table);

  if (columns.size === 0) {
    throw new Error(`数据表 ${table} 不存在或当前账号无访问权限`);
  }

  const idColumn = options.idColumn || 'id';
  return query(`DELETE FROM \`${table}\` WHERE \`${idColumn}\` = :id LIMIT 1`, { id: identifier });
};

const testConnection = async () => {
  try {
    await pool.query('SELECT DATABASE()');
    console.log(`[database] MySQL 连接就绪：${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    return true;
  } catch (error) {
    console.error('[database] 无法连接 MySQL：', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  transactional,
  getTableColumns,
  clearTableColumnCache,
  tableExists,
  insertRecord,
  updateRecord,
  deleteRecord,
  testConnection,
};
