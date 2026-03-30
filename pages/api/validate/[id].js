import { getPool } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }


  const { action } = req.body;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action parameter.' });
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  try {
    const pool = getPool();
    const [result] = await pool.execute(
      'UPDATE responses SET status = ? WHERE id = ?',
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data ID tidak ditemukan.' });
    }

    res.status(200).json({ 
      message: `Data ID ${id} berhasil diubah menjadi status: ${newStatus}.`,
      status: newStatus 
    });

  } catch (error) {
    console.error('API VALIDATE ERROR:', error);
    res.status(500).json({ message: 'Gagal memperbarui status data di database.' });
  }
}