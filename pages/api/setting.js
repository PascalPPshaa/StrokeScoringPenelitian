import { getPool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // GET setting
    try {
      const pool = await getPool();
      const [rows] = await pool.query(
        'SELECT enablesimpan FROM setting WHERE id = ?',
        [1001]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      
      return res.status(200).json({ enablesimpan: rows[0].enablesimpan });
    } catch (err) {
      console.error('Error fetching setting:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
  }
  
  if (req.method === 'PUT') {
    // UPDATE setting
    try {
      const { enablesimpan } = req.body;
      
      if (enablesimpan === undefined) {
        return res.status(400).json({ error: 'enablesimpan value required' });
      }
      
      const pool = await getPool();
      const [result] = await pool.query(
        'UPDATE setting SET enablesimpan = ? WHERE id = ?',
        [enablesimpan ? 1 : 0, 1001]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      
      return res.status(200).json({ ok: true, enablesimpan: enablesimpan ? 1 : 0 });
    } catch (err) {
      console.error('Error updating setting:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}