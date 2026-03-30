import { getPool } from '../../../lib/db';
import PDFDocument from 'pdfkit';

function fmtDate(d) {
  const dt = new Date(d);
  return dt.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PRIMARY_COLOR = '#3B82F6';
const SECONDARY_COLOR = '#10B981';
const DANGER_COLOR = '#EF4444';
const WARNING_COLOR = '#F59E0B';
const TEXT_COLOR = '#1F2937';
const LIGHT_BG = '#F9FAFB';
const BORDER_COLOR = '#E5E7EB';
const DARK_BORDER = '#D1D5DB';

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM responses WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const row = rows[0];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report_${row.id}.pdf"`);

    const doc = new PDFDocument({ margin: 35, size: 'A4' });
    doc.pipe(res);

    // ===== HEADER =====
    doc.fillColor(PRIMARY_COLOR)
      .fontSize(26)
      .font('Helvetica-Bold')
      .text('Laporan Risiko Infeksi', { align: 'center' });
    
    doc.fillColor(SECONDARY_COLOR)
      .fontSize(13)
      .font('Helvetica')
      .text('Penyintas Stroke', { align: 'center' });
    
    doc.moveDown(0.2);
    doc.strokeColor(PRIMARY_COLOR)
      .lineWidth(3)
      .moveTo(35, doc.y)
      .lineTo(555, doc.y)
      .stroke();
    
    doc.moveDown(0.4);
    doc.fillColor(TEXT_COLOR)
      .fontSize(8.5)
      .font('Helvetica-Oblique')
      .text(`Dibuat pada: ${fmtDate(new Date())}`, { align: 'right' });
    
    doc.moveDown(1);

    // ===== INFORMASI PENYINTAS =====
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(PRIMARY_COLOR)
      .text('Informasi Penyintas', 35);
    
    doc.strokeColor(PRIMARY_COLOR)
      .lineWidth(2)
      .moveTo(35, doc.y)
      .lineTo(555, doc.y)
      .stroke();
    
    doc.moveDown(0.5);

    const survivorInfo = [
      { label: 'ID Responden', value: row.id },
      { label: 'Nama Penyintas', value: row.nama_penyintas || '-' },
      { label: 'Usia', value: `${row.usia ?? '-'} tahun` },
      { label: 'Nama Caregiver', value: row.nama_caregiver || '-' },
      { label: 'Hubungan', value: row.hubungan || '-' },
      { label: 'Lama Sejak Stroke', value: row.lama_sejak_stroke || '-' },
    ];

    const col1LabelX = 35;
    const col1ValueX = 130;
    const col2LabelX = 315;
    const col2ValueX = 410;
    const rowSpacing = 14;
    let currentY = doc.y;

    doc.fillColor(TEXT_COLOR).fontSize(9.5);

    for (let i = 0; i < survivorInfo.length; i += 2) {
      doc.font('Helvetica-Bold')
        .text(survivorInfo[i].label + ':', col1LabelX, currentY, { width: 90 });
      
      doc.font('Helvetica')
        .text(String(survivorInfo[i].value), col1ValueX, currentY, { width: 150 });

      if (survivorInfo[i + 1]) {
        doc.font('Helvetica-Bold')
          .text(survivorInfo[i + 1].label + ':', col2LabelX, currentY, { width: 90 });
        
        doc.font('Helvetica')
          .text(String(survivorInfo[i + 1].value), col2ValueX, currentY, { width: 150 });
      }

      currentY += rowSpacing;
    }

    doc.moveDown(0.8);

    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(PRIMARY_COLOR)
      .text('Ringkasan Skor', 35);
    
    doc.strokeColor(PRIMARY_COLOR)
      .lineWidth(2)
      .moveTo(35, doc.y)
      .lineTo(555, doc.y)
      .stroke();
    
    doc.moveDown(0.5);
    doc.fillColor(TEXT_COLOR).fontSize(9.5);

    doc.font('Helvetica-Bold')
      .text('Total Skor:', col1LabelX, doc.y, { width: 90 });
    
    doc.font('Helvetica')
      .text(String(row.total_score ?? '-'), col1ValueX, doc.y - 0, { width: 150 });

    doc.moveDown(0.5);

    let riskColor = TEXT_COLOR;
    if (row.risk_level) {
      const level = row.risk_level.toLowerCase();
      if (level.includes('tinggi')) riskColor = DANGER_COLOR;
      else if (level.includes('sedang')) riskColor = WARNING_COLOR;
      else if (level.includes('rendah')) riskColor = SECONDARY_COLOR;
    }

    doc.font('Helvetica-Bold')
      .fillColor(TEXT_COLOR)
      .text('Tingkat Risiko:', col1LabelX, doc.y, { width: 90 });
    
    doc.font('Helvetica-Bold')
      .fillColor(riskColor)
      .text(row.risk_level ?? '-', col1ValueX, doc.y - 0, { width: 150 });

    doc.moveDown(0.9);

    doc.fillColor(TEXT_COLOR);
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(PRIMARY_COLOR)
      .text('Detail Observasi Klinis', 35);
    
    doc.strokeColor(PRIMARY_COLOR)
      .lineWidth(2)
      .moveTo(35, doc.y)
      .lineTo(555, doc.y)
      .stroke();
    
    doc.moveDown(0.5);

    const fieldsMap = {
      'mobilitas': 'Mobilitas',
      'kontrol_bak': 'Kontrol BAK',
      'penggunaan_kateter': 'Penggunaan Kateter',
      'kesulitan_menyelan': 'Kesulitan Menelan',
      'kondisi_nutrisi_kulit': 'Kondisi Nutrisi/Kulit',
      'frekuensi_mandi': 'Frekuensi Mandi',
      'kebersihan_lipatan': 'Kebersihan Lipatan Kulit',
      'penggantian_popok': 'Penggantian Popok',
      'penggantian_seprai': 'Penggantian Seprai',
      'kebersihan_tangan': 'Kebersihan Tangan Caregiver',
      'kebersihan_ruangan': 'Kebersihan Ruangan',
      'demam': 'Demam',
      'gejala_batuk': 'Gejala Batuk',
      'gejala_sesak': 'Gejala Sesak Nafas',
      'gejala_grokk': 'Gejala Grok-grok',
      'isi_asl_urine_keruh': 'Urine Keruh',
      'isi_urine_bau': 'Urine Berbau Menyengat',
      'isi_sering_bak': 'Sering BAK/Nyeri',
      'kulit_kemerahan': 'Kulit Kemerahan',
      'kulit_luka_besar': 'Luka/Luka Tekan',
      'kulit_bernanh': 'Luka Bernanah',
      'perubahan_mental': 'Perubahan Status Mental',
    };

    const formatValue = (val) => {
      if (val === null || val === undefined) return '-';
      if (typeof val === 'number') return val === 1 ? 'Ya' : (val === 0 ? 'Tidak' : String(val));
      return String(val);
    };

    doc.fillColor(TEXT_COLOR).fontSize(9);

    const keys = Object.keys(fieldsMap);
    const halfLength = Math.ceil(keys.length / 2);
    currentY = doc.y;

    for (let i = 0; i < halfLength; i++) {
      if (currentY > 710) {
        doc.addPage();
        currentY = 40;
      }
      const leftKey = keys[i];
      const leftLabel = fieldsMap[leftKey];
      const leftValue = formatValue(row[leftKey]);

      doc.font('Helvetica-Bold')
        .fontSize(8.5)
        .text(leftLabel + ':', col1LabelX, currentY, { width: 120 });
      
      doc.font('Helvetica')
        .fontSize(8.5)
        .text(leftValue, col1LabelX + 125, currentY, { width: 70 });

      const rightKey = keys[i + halfLength];
      if (rightKey) {
        const rightLabel = fieldsMap[rightKey];
        const rightValue = formatValue(row[rightKey]);

        doc.font('Helvetica-Bold')
          .fontSize(8.5)
          .text(rightLabel + ':', col2LabelX, currentY, { width: 120 });
        
        doc.font('Helvetica')
          .fontSize(8.5)
          .text(rightValue, col2LabelX + 125, currentY, { width: 70 });
      }

      currentY += 13;
      doc.y = currentY;
    }

    doc.moveDown(0.8);
    if (row.notes && row.notes.trim()) {
      doc.fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(PRIMARY_COLOR)
        .text('Catatan Tambahan', 35);
      
      doc.strokeColor(PRIMARY_COLOR)
        .lineWidth(2)
        .moveTo(35, doc.y)
        .lineTo(555, doc.y)
        .stroke();
      
      doc.moveDown(0.4);
      doc.fillColor(TEXT_COLOR)
        .fontSize(9)
        .font('Helvetica')
        .text(row.notes, 35, doc.y, { align: 'justify', width: 520 });
      
      doc.moveDown(0.6);
    }

    doc.moveDown(0.5);
    doc.strokeColor(BORDER_COLOR)
      .lineWidth(1)
      .moveTo(35, doc.y)
      .lineTo(555, doc.y)
      .stroke();

    doc.moveDown(0.4);
    doc.fontSize(7.5)
      .font('Helvetica-Oblique')
      .fillColor('#999999')
      .text('Catatan: Laporan ini dihasilkan otomatis berdasarkan entri formulir penilaian risiko infeksi penyintas stroke. Untuk informasi lebih lanjut hubungi administrator sistem.', {
        align: 'center',
        width: 520,
      });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}