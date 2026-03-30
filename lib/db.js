// import mysql from 'mysql2/promise';

// let pool;

// export async function getPool() {
//   if (!pool) {
//     pool = mysql.createPool({
//       host: process.env.DB_HOST,
//       port: process.env.DB_PORT || 3306,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       waitForConnections: true,
//       connectionLimit: 10,
//       queueLimit: 0
//     });
//   }
//   return pool;
// }


// import mysql from 'mysql2/promise';


// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT || 3306,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// export async function query(sql, params) {
//   const [rows] = await pool.execute(sql, params);
//   return rows;
// }

import mysql from 'mysql2/promise';

let pool;

// export function getPool() {
//   if (!pool) {
//     pool = mysql.createPool({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD ,
//       database: process.env.DB_NAME,
//       waitForConnections: true,
//       connectionLimit: 10,
//       queueLimit: 0
//     });
//   }
//   return pool;
// }
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      // Mengikuti standar Project B
      host: (process.env.DB_HOST || '').trim(),
      port: parseInt(process.env.DB_PORT), 
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, // Pastikan di .env namanya DB_PASSWORD atau DB_PASS sesuai Project B
      database: process.env.DB_NAME,
      
      // Pengaturan Pool (Menyamakan dengan Project B)
      waitForConnections: true,
      connectionLimit: 5, // Project B menggunakan max: 5
      queueLimit: 0,
      idleTimeout: 10000, // Menyamakan 'idle' di Project B (10 detik)
      
      // Bagian KRUSIAL untuk Aiven (SSL)
      ssl: {
        rejectUnauthorized: false // Menyamakan logic Project B
      },
      
      // Timeout tambahan agar tidak gampang disconnect
      connectTimeout: 60000 
    });
  }
  return pool;
}
export async function query(sql, params) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

