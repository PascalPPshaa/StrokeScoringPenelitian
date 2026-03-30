import { getPool } from '../../lib/db';
import { calcScoreAndRisk } from '../../lib/score';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body;

  if (!body.nama_penyintas) return res.status(400).json({ error: 'Nama penyintas dibutuhkan' });

  const normalized = { ...body };

  const numericFields = [
    'mobilitas','kontrol_bak','penggunaan_kateter','kesulitan_menyelan','kondisi_nutrisi_kulit',
    'frekuensi_mandi','kebersihan_lipatan','penggantian_popok','penggantian_seprai','kebersihan_tangan','kebersihan_ruangan',
    'demam','perubahan_mental'
  ];
  numericFields.forEach(k => {
    if (normalized[k] === undefined) normalized[k] = 0;
    normalized[k] = Number(normalized[k]);
  });

  const boolKeys = [
    'gejala_batuk','gejala_sesak','gejala_grokk',
    'isi_asl_urine_keruh','isi_urine_bau','isi_sering_bak',
    'kulit_kemerahan','kulit_luka_besar','kulit_bernanh'
  ];
  boolKeys.forEach(k => {
    normalized[k] = normalized[k] === 'on' || normalized[k] === 'true' || normalized[k] === true || normalized[k] === 1;
  });

  const { total, risk } = calcScoreAndRisk(normalized);

  try {
    const pool = await getPool();

    const [settings] = await pool.query(
      'SELECT enablesimpan FROM setting WHERE id = ?',
      [1001]
    );

    const enableSave = settings.length > 0 && settings[0].enablesimpan === 1;

    if (!enableSave) {
      return res.status(200).json({ 
        ok: true, 
        saved: false,
        nama_penyintas: normalized.nama_penyintas, 
        total, 
        risk,
        message: 'Data not saved (disabled in settings)'
      });
    }
    const [result] = await pool.query(
      `
    INSERT INTO responses 
    (
      nama_penyintas, usia, nama_caregiver, hubungan, lama_sejak_stroke,
      mobilitas, kontrol_bak, penggunaan_kateter, kesulitan_menyelan, kondisi_nutrisi_kulit,
      frekuensi_mandi, kebersihan_lipatan, penggantian_popok, penggantian_seprai, kebersihan_tangan, kebersihan_ruangan,
      demam, gejala_batuk, gejala_sesak, gejala_grokk,
      isi_asl_urine_keruh, isi_urine_bau, isi_sering_bak,
      kulit_kemerahan, kulit_luka_besar, kulit_bernanh,
      perubahan_mental, total_score, risk_level, notes
    )
    VALUES (?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?)
    `,
      [
        normalized.nama_penyintas,
        normalized.usia || null,
        normalized.nama_caregiver || null,
        normalized.hubungan || null,
        normalized.lama_sejak_stroke || null,
        normalized.mobilitas, normalized.kontrol_bak, normalized.penggunaan_kateter, normalized.kesulitan_menyelan, normalized.kondisi_nutrisi_kulit,
        normalized.frekuensi_mandi, normalized.kebersihan_lipatan, normalized.penggantian_popok, normalized.penggantian_seprai, normalized.kebersihan_tangan, normalized.kebersihan_ruangan,
        normalized.demam, normalized.gejala_batuk ? 1 : 0, normalized.gejala_sesak ? 1 : 0, normalized.gejala_grokk ? 1 : 0,
        normalized.isi_asl_urine_keruh ? 1 : 0, normalized.isi_urine_bau ? 1 : 0, normalized.isi_sering_bak ? 1 : 0,
        normalized.kulit_kemerahan ? 1 : 0, normalized.kulit_luka_besar ? 1 : 0, normalized.kulit_bernanh ? 1 : 0,
        normalized.perubahan_mental, total, risk, normalized.notes || null
      ]
    );

    return res.status(200).json({ 
      ok: true, 
      id: result.insertId, 
      nama_penyintas: normalized.nama_penyintas, 
      total, 
      risk,
      saved: true 
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'DB error', details: err.message });
  }
}
