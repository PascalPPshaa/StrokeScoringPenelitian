import { getPool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const pool = await getPool();
  const { id } = req.query;

  try {
    const [rows] = await pool.query("DELETE FROM responses WHERE id = ?", [id]);

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    return res.status(200).json({ message: 'Deleted successfully' });

  } catch (err) {
    console.error("Delete API error:", err);

    if (err?.errno === 1451) {
      return res.status(409).json({
        message: 'Tidak bisa dihapus karena foreign key constraint.'
      });
    }

    return res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
}
