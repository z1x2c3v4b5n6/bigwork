import mysql from 'mysql2/promise';

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = '',
  DB_CONNECTION_LIMIT = '10',
} = process.env;

let pool;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(DB_CONNECTION_LIMIT),
      charset: 'utf8mb4',
      namedPlaceholders: true,
    });
  }

  return pool;
};

export const query = async (sql, params = []) => {
  const connection = getPool();
  const [rows] = await connection.query(sql, params);
  return rows;
};
