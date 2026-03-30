export function calcScoreAndRisk(values) {

  let total = 0;

  const sec2_keys = ['mobilitas','kontrol_bak','penggunaan_kateter','kesulitan_menyelan','kondisi_nutrisi_kulit'];
  for (const k of sec2_keys) {
    const v = Number(values[k] ?? 0);
    total += v;
  }

  const sec3_keys = ['frekuensi_mandi','kebersihan_lipatan','penggantian_popok','penggantian_seprai','kebersihan_tangan','kebersihan_ruangan'];
  for (const k of sec3_keys) {
    total += Number(values[k] ?? 0);
  }

  total += Number(values.demam ?? 0);

  total += (values.gejala_batuk ? 1 : 0)
        + (values.gejala_sesak ? 1 : 0)
        + (values.gejala_grokk ? 1 : 0);

  total += (values.isi_asl_urine_keruh ? 1 : 0)
        + (values.isi_urine_bau ? 1 : 0)
        + (values.isi_sering_bak ? 1 : 0);

  total += (values.kulit_kemerahan ? 1 : 0)
        + (values.kulit_luka_besar ? 1 : 0)
        + (values.kulit_bernanh ? 1 : 0);

  total += Number(values.perubahan_mental ?? 0);

  let risk = 'Rendah';
  if (total >= 17) risk = 'Tinggi';
  else if (total >= 9) risk = 'Sedang';

  return { total, risk };
}
