// import { getPool } from '../../lib/db';

// export default async function handler(req, res) {
//   try {
//     const pool = getPool();

//     const [rows] = await pool.execute(
//       `SELECT id, created_at, nama_penyintas, usia, total_score, risk_level 
//        FROM responses 
//        ORDER BY created_at DESC 
//        LIMIT 200`
//     );

//     res.status(200).json({ rows });
//   } catch (err) {
//     console.error("LIST API ERROR:", err);
//     res.status(500).json({ error: 'DB error' });
//   }
// }

// /pages/api/list.js

import { getPool } from '../../lib/db';

export default async function handler(req, res) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, created_at, nama_penyintas, usia, total_score, risk_level, status 
       FROM responses 
       ORDER BY created_at DESC 
       LIMIT 200`
    );

    res.status(200).json({ rows });
  } catch (err) {
    console.error("LIST API ERROR:", err);
    res.status(500).json({ error: 'DB error' });
  }
}
