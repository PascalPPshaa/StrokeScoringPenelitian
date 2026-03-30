import { useState, useRef } from 'react';
import Head from 'next/head'; 
import styles from '../styles/Form.module.css';

const calculateRiskScore = (formData) => {
    let totalScore = 0;
    
    const safeParseInt = (value) => parseInt(value || '0', 10);
    
    totalScore += safeParseInt(formData.mobilitas);
    totalScore += safeParseInt(formData.kontrol_bak);
    totalScore += safeParseInt(formData.penggunaan_kateter);
    totalScore += safeParseInt(formData.kesulitan_menyelan);
    totalScore += safeParseInt(formData.kondisi_nutrisi_kulit);
    
    totalScore += safeParseInt(formData.frekuensi_mandi);
    totalScore += safeParseInt(formData.kebersihan_lipatan);
    totalScore += safeParseInt(formData.penggantian_popok);
    totalScore += safeParseInt(formData.penggantian_seprai);
    totalScore += safeParseInt(formData.kebersihan_tangan);
    totalScore += safeParseInt(formData.kebersihan_ruangan);
    
    totalScore += safeParseInt(formData.demam);
    totalScore += safeParseInt(formData.perubahan_mental);

    if (formData.gejala_batuk) totalScore += 1;
    if (formData.gejala_sesak) totalScore += 1;
    if (formData.gejala_grokk) totalScore += 1;
    if (formData.isi_asl_urine_keruh) totalScore += 1;
    if (formData.isi_urine_bau) totalScore += 1;
    if (formData.isi_sering_bak) totalScore += 1;
    if (formData.kulit_kemerahan) totalScore += 1;
    if (formData.kulit_luka_besar) totalScore += 1;
    if (formData.kulit_bernanh) totalScore += 1;

    let riskLevel = 'Risiko Rendah'; 
    if (totalScore >= 11) {
        riskLevel = 'Risiko Tinggi';
    } else if (totalScore >= 6) {
        riskLevel = 'Risiko Sedang';
    }

    return {
        total: totalScore,
        risk: riskLevel,
        nama_penyintas: formData.nama_penyintas || '—',
        error: null,
        id: null 
    };
};

export default function Home() {
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeSection, setActiveSection] = useState(1);
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({});
    const formRef = useRef(null);

    const validationRules = {
        1: {
            nama_penyintas: { required: true, message: 'Nama Penyintas harus diisi' },
        },
        2: {
            mobilitas: { required: true, message: 'Kemampuan Mobilitas harus dipilih' },
            kontrol_bak: { required: true, message: 'Kontrol BAK harus dipilih' },
            penggunaan_kateter: { required: true, message: 'Penggunaan Kateter harus dipilih' },
            kesulitan_menyelan: { required: true, message: 'Kesulitan Menelan harus dipilih' },
            kondisi_nutrisi_kulit: { required: true, message: 'Kondisi Nutrisi & Kulit harus dipilih' },
        },
        3: {
            frekuensi_mandi: { required: true, message: 'Frekuensi Mandi harus dipilih' },
            kebersihan_lipatan: { required: true, message: 'Kebersihan Lipatan Tubuh harus dipilih' },
            penggantian_popok: { required: true, message: 'Penggantian Popok harus dipilih' },
            penggantian_seprai: { required: true, message: 'Penggantian Seprai & Pakaian harus dipilih' },
            kebersihan_tangan: { required: true, message: 'Kebersihan Tangan Caregiver harus dipilih' },
            kebersihan_ruangan: { required: true, message: 'Kebersihan Ruangan & Ventilasi harus dipilih' },
        },
        4: {
            demam: { required: true, message: 'Demam dalam 7 Hari Terakhir harus dipilih' },
            perubahan_mental: { required: true, message: 'Perubahan Mental / Kesadaran harus dipilih' },
        },
    };

    const getFormData = (target) => {
        const form = new FormData(target);
        const body = Object.fromEntries(form.entries());

        for (const key in body) {
            if (body[key] === 'on') {
                body[key] = true; 
            }
        }
        return body;
    };

    // Fungsi untuk validasi section
    const validateSection = (section, data = null) => {
        const currentData = data || getFormData(formRef.current);
        const rules = validationRules[section];
        const errors = {};

        if (rules) {
            for (const [field, rule] of Object.entries(rules)) {
                if (rule.required) {
                    const value = currentData[field];
                    if (!value || value === '' || value === 'on') {
                        errors[field] = rule.message;
                    }
                }
            }
        }

        return errors;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };
        setFormData(newFormData);
        
        if (validationErrors[name]) {
            const newErrors = { ...validationErrors };
            delete newErrors[name];
            setValidationErrors(newErrors);
        }
    };

    const handleNavigateToSection = (targetSection) => {
        const errors = validateSection(activeSection);

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({});
        setActiveSection(targetSection);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateSection(4);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setSubmitting(true);
        
        const body = getFormData(e.target);
        let calculationResult;

        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            calculationResult = await res.json();
        } catch (error) {
            calculationResult = { error: 'Terjadi kesalahan saat mengirim data ke server. Coba lagi.' };
            console.error('Submission error:', error);
        }

        setResult(calculationResult);
        setSubmitting(false);
    };

    const handleClear = () => {
        if (formRef.current) {
            formRef.current.reset();
            setResult(null);
            setActiveSection(1);
            setValidationErrors({});
            setFormData({});
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Head>
                <title>Formulir Risiko Infeksi Penyintas Stroke</title>
                <meta name="description" content="Formulir penilaian risiko infeksi untuk penyintas stroke." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            <header className={styles.heroHeader}>
                <div className={styles.heroContent}>
                    <br></br>
                    <br></br>
                    {/* <div className={styles.heroIcon}>🩺</div> */}
                    <h1 className={styles.heroTitle}>Penilaian Risiko Infeksi</h1>
                    <p className={styles.heroSubtitle}>Evaluasi Komprehensif untuk Penyintas Stroke</p>
                    <p className={styles.heroDescription}>
                        Sistem penilaian risiko infeksi berbasis penelitian untuk membantu monitoring kesehatan pasien stroke secara akurat dan terstruktur.
                    </p>
                </div>
            </header>

            <div className={styles.formWrapper}>
                <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{width: `${(activeSection / 4) * 100}%`}}></div>
                    </div>
                    <p className={styles.progressText}>
                        Section <strong>{activeSection}</strong> dari <strong>4</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} ref={formRef} className={styles.modernForm}>
                    
                    <fieldset className={`${styles.fieldset} ${activeSection === 1 ? styles.activeSection : ''}`}>
                        <legend className={styles.modernLegend}>
                            <span className={styles.sectionNumber}>1</span>
                            <span className={styles.legendText}>Informasi Dasar</span>
                        </legend>
                        
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="nama_penyintas" className={styles.label}>Nama Penyintas <span className={styles.required}>*</span></label>
                                <input 
                                    id="nama_penyintas" 
                                    name="nama_penyintas" 
                                    className={`${styles.modernInput} ${validationErrors.nama_penyintas ? styles.inputError : ''}`}
                                    placeholder="Masukkan nama lengkap"
                                    onChange={handleInputChange}
                                />
                                {validationErrors.nama_penyintas && (
                                    <p className={styles.errorMessage}>{validationErrors.nama_penyintas}</p>
                                )}
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="usia" className={styles.label}>Usia (tahun)</label>
                                <input 
                                    id="usia" 
                                    name="usia" 
                                    type="number" 
                                    className={styles.modernInput} 
                                    placeholder="Contoh: 65"
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="nama_caregiver" className={styles.label}>Nama Caregiver</label>
                                <input 
                                    id="nama_caregiver" 
                                    name="nama_caregiver" 
                                    className={styles.modernInput} 
                                    placeholder="Nama lengkap caregiver"
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="hubungan" className={styles.label}>Hubungan dengan Penyintas</label>
                                <input 
                                    id="hubungan" 
                                    name="hubungan" 
                                    className={styles.modernInput} 
                                    placeholder="Contoh: Istri, Anak, Perawat"
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="lama_sejak_stroke" className={styles.label}>Lama sejak Stroke</label>
                                <select 
                                    id="lama_sejak_stroke" 
                                    name="lama_sejak_stroke" 
                                    className={styles.modernSelect}
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih Durasi —</option>
                                    <option>0–3 bulan</option>
                                    <option>3–12 bulan</option>
                                    <option>12 bulan</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            className={styles.sectionNavButton}
                            onClick={() => handleNavigateToSection(2)}
                        >
                            Lanjut ke Halaman Selanjutnya
                        </button>
                    </fieldset>

                    <fieldset className={`${styles.fieldset} ${activeSection === 2 ? styles.activeSection : ''}`}>
                        <legend className={styles.modernLegend}>
                            <span className={styles.sectionNumber}>2</span>
                            <span className={styles.legendText}>Faktor Risiko Dasar</span>
                        </legend>
                        
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="mobilitas" className={styles.label}>6. Kemampuan Mobilitas <span className={styles.required}>*</span></label>
                                <select 
                                    id="mobilitas" 
                                    name="mobilitas" 
                                    className={`${styles.modernSelect} ${validationErrors.mobilitas ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">Mandiri (0)</option>
                                    <option value="1">Perlu bantuan sebagian (1)</option>
                                    <option value="2">Tirah baring sebagian besar waktu (2)</option>
                                </select>
                                {validationErrors.mobilitas && (
                                    <p className={styles.errorMessage}>{validationErrors.mobilitas}</p>
                                )}
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="kontrol_bak" className={styles.label}>7. Kontrol BAK <span className={styles.required}>*</span></label>
                                <select 
                                    id="kontrol_bak" 
                                    name="kontrol_bak" 
                                    className={`${styles.modernSelect} ${validationErrors.kontrol_bak ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">Normal (0)</option>
                                    <option value="1">Kadang tidak terkontrol (1)</option>
                                    <option value="2">Sering tidak terkontrol / pakai popok (2)</option>
                                </select>
                                {validationErrors.kontrol_bak && (
                                    <p className={styles.errorMessage}>{validationErrors.kontrol_bak}</p>
                                )}
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="penggunaan_kateter" className={styles.label}>8. Penggunaan Kateter <span className={styles.required}>*</span></label>
                                <select 
                                    id="penggunaan_kateter" 
                                    name="penggunaan_kateter" 
                                    className={`${styles.modernSelect} ${validationErrors.penggunaan_kateter ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">Tidak (0)</option>
                                    <option value="2">Ya, kateter menetap (2)</option>
                                </select>
                                {validationErrors.penggunaan_kateter && (
                                    <p className={styles.errorMessage}>{validationErrors.penggunaan_kateter}</p>
                                )}
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="kesulitan_menyelan" className={styles.label}>9. Kesulitan Menelan <span className={styles.required}>*</span></label>
                                <select 
                                    id="kesulitan_menyelan" 
                                    name="kesulitan_menyelan" 
                                    className={`${styles.modernSelect} ${validationErrors.kesulitan_menyelan ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">Tidak pernah (0)</option>
                                    <option value="1">Kadang-kadang (1)</option>
                                    <option value="2">Sering tersedak (2)</option>
                                </select>
                                {validationErrors.kesulitan_menyelan && (
                                    <p className={styles.errorMessage}>{validationErrors.kesulitan_menyelan}</p>
                                )}
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="kondisi_nutrisi_kulit" className={styles.label}>10. Kondisi Nutrisi & Kulit <span className={styles.required}>*</span></label>
                                <select 
                                    id="kondisi_nutrisi_kulit" 
                                    name="kondisi_nutrisi_kulit" 
                                    className={`${styles.modernSelect} ${validationErrors.kondisi_nutrisi_kulit ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">Makan baik, kulit sehat (0)</option>
                                    <option value="1">Makan kurang stabil, kulit kering (1)</option>
                                    <option value="2">Berat badan menurun / kulit rapuh (2)</option>
                                </select>
                                {validationErrors.kondisi_nutrisi_kulit && (
                                    <p className={styles.errorMessage}>{validationErrors.kondisi_nutrisi_kulit}</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.sectionButtonGroup}>
                            <button 
                                type="button" 
                                className={styles.sectionNavButtonSecondary}
                                onClick={() => setActiveSection(1)}
                            >
                                Kembali ke Halaman Sebelumnya
                            </button>
                            <button 
                                type="button" 
                                className={styles.sectionNavButton}
                                onClick={() => handleNavigateToSection(3)}
                            >
                                Lanjut ke Halaman Selanjutnya
                            </button>
                        </div>
                    </fieldset>

                    <fieldset className={`${styles.fieldset} ${activeSection === 3 ? styles.activeSection : ''}`}>
                        <legend className={styles.modernLegend}>
                            <span className={styles.sectionNumber}>3</span>
                            <span className={styles.legendText}>Praktik Kebersihan & Perawatan</span>
                        </legend>

                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="frekuensi_mandi" className={styles.label}>11. Frekuensi Mandi <span className={styles.required}>*</span></label>
                                <select 
                                    id="frekuensi_mandi" 
                                    name="frekuensi_mandi" 
                                    className={`${styles.modernSelect} ${validationErrors.frekuensi_mandi ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">2x sehari (0)</option>
                                    <option value="1">1x sehari (1)</option>
                                    <option value="2">Tidak setiap hari (2)</option>
                                </select>
                                {validationErrors.frekuensi_mandi && (
                                    <p className={styles.errorMessage}>{validationErrors.frekuensi_mandi}</p>
                                )}
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="kebersihan_lipatan" className={styles.label}>12. Kebersihan Lipatan Tubuh <span className={styles.required}>*</span></label>
                                <select 
                                    id="kebersihan_lipatan" 
                                    name="kebersihan_lipatan" 
                                    className={`${styles.modernSelect} ${validationErrors.kebersihan_lipatan ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">Selalu dibersihkan (0)</option>
                                    <option value="1">Kadang-kadang (1)</option>
                                    <option value="2">Jarang (2)</option>
                                </select>
                                {validationErrors.kebersihan_lipatan && (
                                    <p className={styles.errorMessage}>{validationErrors.kebersihan_lipatan}</p>
                                )}
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="penggantian_popok" className={styles.label}>13. Penggantian Popok <span className={styles.required}>*</span></label>
                                <select 
                                    id="penggantian_popok" 
                                    name="penggantian_popok" 
                                    className={`${styles.modernSelect} ${validationErrors.penggantian_popok ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">Setiap 4–6 jam atau bila kotor (0)</option>
                                    <option value="1">2–3x sehari (1)</option>
                                    <option value="2">&lt; 2x sehari (2)</option>
                                </select>
                                {validationErrors.penggantian_popok && (
                                    <p className={styles.errorMessage}>{validationErrors.penggantian_popok}</p>
                                )}
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="penggantian_seprai" className={styles.label}>14. Penggantian Seprai & Pakaian <span className={styles.required}>*</span></label>
                                <select 
                                    id="penggantian_seprai" 
                                    name="penggantian_seprai" 
                                    className={`${styles.modernSelect} ${validationErrors.penggantian_seprai ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">2–3x seminggu (0)</option>
                                    <option value="1">1x seminggu (1)</option>
                                    <option value="2">&lt; 1x seminggu (2)</option>
                                </select>
                                {validationErrors.penggantian_seprai && (
                                    <p className={styles.errorMessage}>{validationErrors.penggantian_seprai}</p>
                                )}
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="kebersihan_tangan" className={styles.label}>15. Kebersihan Tangan Caregiver <span className={styles.required}>*</span></label>
                                <select 
                                    id="kebersihan_tangan" 
                                    name="kebersihan_tangan" 
                                    className={`${styles.modernSelect} ${validationErrors.kebersihan_tangan ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">Selalu cuci tangan (0)</option>
                                    <option value="1">Kadang-kadang (1)</option>
                                    <option value="2">Jarang (2)</option>
                                </select>
                                {validationErrors.kebersihan_tangan && (
                                    <p className={styles.errorMessage}>{validationErrors.kebersihan_tangan}</p>
                                )}
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="kebersihan_ruangan" className={styles.label}>16. Kebersihan Ruangan & Ventilasi <span className={styles.required}>*</span></label>
                                <select 
                                    id="kebersihan_ruangan" 
                                    name="kebersihan_ruangan" 
                                    className={`${styles.modernSelect} ${validationErrors.kebersihan_ruangan ? styles.inputError : ''}`}
                                    defaultValue="0"
                                    onChange={handleInputChange}
                                >
                                    <option value="">— Pilih —</option>
                                    <option value="0">Dibersihkan & jendela dibuka setiap hari (0)</option>
                                    <option value="1">Dibersihkan kadang-kadang (1)</option>
                                    <option value="2">Jarang dibuka, ruangan pengap (2)</option>
                                </select>
                                {validationErrors.kebersihan_ruangan && (
                                    <p className={styles.errorMessage}>{validationErrors.kebersihan_ruangan}</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.sectionButtonGroup}>
                            <button 
                                type="button" 
                                className={styles.sectionNavButtonSecondary}
                                onClick={() => setActiveSection(2)}
                            >
                                Kembali ke Halaman Sebelumnya
                            </button>
                            <button 
                                type="button" 
                                className={styles.sectionNavButton}
                                onClick={() => handleNavigateToSection(4)}
                            >
                                Lanjut ke Halaman Selanjutnya
                            </button>
                        </div>
                    </fieldset>

                    <fieldset className={`${styles.fieldset} ${activeSection === 4 ? styles.activeSection : ''}`}>
                        <legend className={styles.modernLegend}>
                            <span className={styles.sectionNumber}>4</span>
                            <span className={styles.legendText}> Tanda & Gejala Infeksi</span>
                        </legend>

                        <div className={styles.inputGroup}>
                            <label htmlFor="demam" className={styles.label}>17. Demam dalam 7 Hari Terakhir <span className={styles.required}>*</span></label>
                            <select 
                                id="demam" 
                                name="demam" 
                                className={`${styles.modernSelect} ${validationErrors.demam ? styles.inputError : ''}`}
                                defaultValue="0"
                                onChange={handleInputChange}
                            >
                                <option value="">— Pilih —</option>
                                <option value="0">Tidak (0)</option>
                                <option value="1">Demam 1–2 hari (1)</option>
                                <option value="2">Demam &gt; 2 hari (2)</option>
                            </select>
                            {validationErrors.demam && (
                                <p className={styles.errorMessage}>{validationErrors.demam}</p>
                            )}
                        </div>

                        <div className={styles.checkboxGroupModern}>
                            <p className={styles.checkboxGroupTitle}>18. Gejala Pernapasan </p>
                            <label className={styles.modernCheckbox}>
                                <input 
                                    type="checkbox" 
                                    name="gejala_batuk" 
                                    className={styles.checkboxInput}
                                    onChange={handleInputChange}
                                />
                                <span className={styles.checkboxCustom}></span>
                                <span className={styles.checkboxLabel}>Batuk berdahak (1)</span>
                            </label>
                            <label className={styles.modernCheckbox}>
                                <input 
                                    type="checkbox" 
                                    name="gejala_sesak" 
                                    className={styles.checkboxInput}
                                    onChange={handleInputChange}
                                />
                                <span className={styles.checkboxCustom}></span>
                                <span className={styles.checkboxLabel}>Sesak napas / napas cepat (1)</span>
                            </label>
                            <label className={styles.modernCheckbox}>
                                <input 
                                    type="checkbox" 
                                    name="gejala_grokk" 
                                    className={styles.checkboxInput}
                                    onChange={handleInputChange}
                                />
                                <span className={styles.checkboxCustom}></span>
                                <span className={styles.checkboxLabel}>Suara grokk-grokk (1)</span>
                            </label>
                        </div>

                        <div className={styles.checkboxGroupModern}>
                            <p className={styles.checkboxGroupTitle}>19. Tanda Infeksi Saluran Kemih </p>
                            <label className={styles.modernCheckbox}>
                                <input 
                                    type="checkbox" 
                                    name="isi_asl_urine_keruh" 
                                    className={styles.checkboxInput}
                                    onChange={handleInputChange}
                                />
                                <span className={styles.checkboxCustom}></span>
                                <span className={styles.checkboxLabel}>Urine keruh (1)</span>
                            </label>
                            <label className={styles.modernCheckbox}>
                                <input 
                                    type="checkbox" 
                                    name="isi_urine_bau" 
                                    className={styles.checkboxInput}
                                    onChange={handleInputChange}
                                />
                                <span className={styles.checkboxCustom}></span>
                                <span className={styles.checkboxLabel}>Urine bau menyengat (1)</span>
                            </label>
                            <label className={styles.modernCheckbox}>
                                <input 
                                    type="checkbox" 
                                    name="isi_sering_bak" 
                                    className={styles.checkboxInput}
                                    onChange={handleInputChange}
                                />
                                <span className={styles.checkboxCustom}></span>
                                <span className={styles.checkboxLabel}>Sering BAK sedikit-sedikit (1)</span>
                            </label>
                        </div>

                        <div className={styles.checkboxGroupModern}>
                            <p className={styles.checkboxGroupTitle}>20. Kondisi Kulit & Luka </p>
                            <label className={styles.modernCheckbox}>
                                <input 
                                    type="checkbox" 
                                    name="kulit_kemerahan" 
                                    className={styles.checkboxInput}
                                    onChange={handleInputChange}
                                />
                                <span className={styles.checkboxCustom}></span>
                                <span className={styles.checkboxLabel}>Kemerahan tidak hilang saat ditekan (1)</span>
                            </label>
                            <label className={styles.modernCheckbox}>
                                <input 
                                    type="checkbox" 
                                    name="kulit_luka_besar" 
                                    className={styles.checkboxInput}
                                    onChange={handleInputChange}
                                />
                                <span className={styles.checkboxCustom}></span>
                                <span className={styles.checkboxLabel}>Luka membesar (1)</span>
                            </label>
                            <label className={styles.modernCheckbox}>
                                <input 
                                    type="checkbox" 
                                    name="kulit_bernanh" 
                                    className={styles.checkboxInput}
                                    onChange={handleInputChange}
                                />
                                <span className={styles.checkboxCustom}></span>
                                <span className={styles.checkboxLabel}>Bernanah / bau (1)</span>
                            </label>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="perubahan_mental" className={styles.label}>21. Perubahan Mental / Kesadaran <span className={styles.required}>*</span></label>
                            <select 
                                id="perubahan_mental" 
                                name="perubahan_mental" 
                                className={`${styles.modernSelect} ${validationErrors.perubahan_mental ? styles.inputError : ''}`}
                                defaultValue="0"
                                onChange={handleInputChange}
                            >
                                <option value="">— Pilih —</option>
                                <option value="0">Tidak (0)</option>
                                <option value="1">Kadang bingung (1)</option>
                                <option value="2">Sering bingung / mengantuk berlebihan (2)</option>
                            </select>
                            {validationErrors.perubahan_mental && (
                                <p className={styles.errorMessage}>{validationErrors.perubahan_mental}</p>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="notes" className={styles.label}>Catatan / Observasi</label>
                            <textarea 
                                id="notes" 
                                name="notes" 
                                rows="4" 
                                className={styles.modernTextarea} 
                                placeholder="Tambahkan catatan penting lainnya..."
                                onChange={handleInputChange}
                            ></textarea>
                        </div>

                        <div className={styles.sectionButtonGroup}>
                            <button 
                                type="button" 
                                className={styles.sectionNavButtonSecondary}
                                onClick={() => setActiveSection(3)}
                            >
                                Kembali ke Halaman Sebelumnya
                            </button>
                            <button type="submit" disabled={submitting} className={styles.submitButtonFinal}>
                                {submitting ? '⏳ Memproses...' : ' Kirim & Hitung Risiko'}
                            </button>
                        </div>
                    </fieldset>
                </form>

                {!result && (
                    <div className={styles.quickActions}>
                        <button type="button" onClick={handleClear} className={styles.clearButtonAlt}>
                            🔄 Reset Form
                        </button>
                    </div>
                )}
            </div>
            {result && (
                <div className={styles.resultContainer}>
                    <div className={styles.resultBox}>
                        {result.error ? (
                            <div className={styles.errorResult}>
                                <div className={styles.errorIcon}>❌</div>
                                <h3>Terjadi Kesalahan</h3>
                                <p>{result.error}</p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.resultHeader}>
                                    <h2 className={styles.resultTitle}> Hasil Perhitungan Risiko</h2>
                                </div>
                                
                                <div className={styles.resultContent}>
                                    <div className={styles.resultInfoGroup}>
                                        <div className={styles.resultItem}>
                                            <span className={styles.resultLabel}>ID</span>
                                            <span className={styles.resultValue}>{result.id ?? '—'}</span>
                                        </div>
                                        <div className={styles.resultItem}>
                                            <span className={styles.resultLabel}>Nama Penyintas</span>
                                            <span className={styles.resultValue}>{result.nama_penyintas}</span>
                                        </div>
                                    </div>

                                    <div className={styles.resultScoreBox}>
                                        <div className={styles.scoreCard}>
                                            <p className={styles.scoreLabel}>Total Skor</p>
                                            <p className={styles.scoreValue}>{result.total}</p>
                                        </div>
                                        <div className={`${styles.riskCard} ${styles[result.risk.toLowerCase().replace(/\s+/g, '') + 'Card']}`}>
                                            <p className={styles.riskLabel}>Level Risiko</p>
                                            <p className={styles.riskValue}>{result.risk}</p>
                                        </div>
                                    </div>

                                    {result.id && (
                                        <a href={`/api/report/${result.id}`} target="_blank" rel="noopener noreferrer" className={styles.downloadButton}>
                                            Unduh Laporan PDF
                                        </a>
                                    )}
                                </div>

                                <button type="button" onClick={handleClear} className={styles.newFormButton}>
                                    Mulai Form Baru
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style global jsx>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                html, body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `}</style>
        </div>
    );
}