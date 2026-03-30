import { getPool } from '../../lib/db';
import ExcelJS from 'exceljs';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM responses ORDER BY created_at DESC');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Responses');

    const cols = [
      { header: 'ID', key: 'id' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Nama', key: 'nama_penyintas' },
      { header: 'Usia', key: 'usia' },
      { header: 'Caregiver', key: 'nama_caregiver' },
      { header: 'Hubungan', key: 'hubungan' },
      { header: 'Lama Stroke', key: 'lama_sejak_stroke' },
      { header: 'Total Skor', key: 'total_score' },
      { header: 'Risk Level', key: 'risk_level' },
      { header: 'Notes', key: 'notes' },
    ];
    sheet.columns = cols;

    rows.forEach(r => {
      sheet.addRow({
        id: r.id,
        created_at: r.created_at,
        nama_penyintas: r.nama_penyintas,
        usia: r.usia,
        nama_caregiver: r.nama_caregiver,
        hubungan: r.hubungan,
        lama_sejak_stroke: r.lama_sejak_stroke,
        total_score: r.total_score,
        risk_level: r.risk_level,
        notes: r.notes
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="responses_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
