import { getPool } from '../../lib/db';
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  try {
    const pool = await getPool();
    const [counts] = await pool.query(
      `SELECT risk_level, COUNT(*) as cnt, AVG(total_score) as avg_score
       FROM responses
       GROUP BY risk_level`
    );

    const result = {
      labels: ['Rendah','Sedang','Tinggi'],
      counts: { Rendah:0, Sedang:0, Tinggi:0 },
      avgScores: { Rendah:0, Sedang:0, Tinggi:0 },
      total: 0
    };

    counts.forEach(r => {
      result.counts[r.risk_level] = Number(r.cnt);
      result.avgScores[r.risk_level] = r.avg_score ? Number(Number(r.avg_score).toFixed(2)) : 0;
      result.total += Number(r.cnt);
    });

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
}
