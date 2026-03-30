// import useSWR from 'swr';
// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import Head from 'next/head';
// import { useRouter } from 'next/router';
// import { Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import styles from '../styles/Admin.module.css';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const fetcher = (url) => fetch(url).then((r) => r.json());

// const statStyling = {
//   Rendah: { icon: '✅', color: '#10b981', detailColor: '#047857' },
//   Sedang: { icon: '⚠️', color: '#f59e0b', detailColor: '#b45309' },
//   Tinggi: { icon: '🚨', color: '#ef4444', detailColor: '#b91c1c' },
//   Lainnya: { icon: '❓', color: '#6b7280', detailColor: '#374151' },
// };

// export default function Admin() {
//   const router = useRouter();

//   const [authChecked, setAuthChecked] = useState(false);
//   const [authenticated, setAuthenticated] = useState(false);
//   const [enableSave, setEnableSave] = useState(null);
//   const [loadingSetting, setLoadingSetting] = useState(false);

//   const { data: stats, error: statsErr } = useSWR(authenticated ? '/api/stats' : null, fetcher);
//   const { data: listRes, error: listErr } = useSWR(authenticated ? '/api/list' : null, fetcher);

//   useEffect(() => {
//     async function checkLogin() {
//       try {
//         const res = await fetch('/api/auth/me');
//         if (res.status === 200) {
//           setAuthenticated(true);
//         } else {
//           router.push('/login');
//           setAuthenticated(false);
//         }
//       } catch (err) {
//         router.push('/login');
//         setAuthenticated(false);
//       }
//       setAuthChecked(true);
//     }
//     checkLogin();
//   }, [router]);

//   useEffect(() => {
//     async function fetchSetting() {
//       try {
//         const res = await fetch('/api/setting');
//         const data = await res.json();
//         setEnableSave(data.enablesimpan === 1);
//       } catch (err) {
//         console.error('Error fetching setting:', err);
//       }
//     }
    
//     if (authenticated) {
//       fetchSetting();
//     }
//   }, [authenticated]);

//   const handleToggleSetting = async (newValue) => {
//     setLoadingSetting(true);
//     try {
//       const res = await fetch('/api/setting', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ enablesimpan: newValue ? 1 : 0 })
//       });
      
//       if (res.status === 200) {
//         setEnableSave(newValue);
//         alert(newValue ? '✅ Penyimpanan data DIAKTIFKAN' : '⛔ Penyimpanan data DINONAKTIFKAN');
//       } else {
//         alert('Gagal mengubah pengaturan');
//       }
//     } catch (err) {
//       console.error('Error updating setting:', err);
//       alert('Terjadi kesalahan');
//     } finally {
//       setLoadingSetting(false);
//     }
//   };

//   if (!authChecked) {
//     return <div className={styles.loadingContainer}>⏳ Memeriksa akses...</div>;
//   }

//   if (!authenticated) {
//     return null;
//   }
  
//   if (statsErr || listErr)
//     return <div className={styles.loadingContainer}>❌ Error loading data</div>;

//   if (!stats || !listRes)
//     return <div className={styles.loadingContainer}>⏳ Loading...</div>;

//   const labels = stats.labels;
//   const counts = labels.map((l) => stats.counts[l] ?? 0);

//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: 'Jumlah Responden',
//         data: counts,
//         borderWidth: 1,
//         backgroundColor: '#3b82f6',
//         borderColor: '#3b82f6',
//         borderRadius: 6,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: { position: 'top' },
//       title: { display: false },
//     },
//     scales: {
//       y: { beginAtZero: true },
//     },
//   };

//   const handleLogout = async () => {
//     if (window.confirm('Apakah Anda yakin ingin keluar?')) {
//       await fetch('/api/auth/logout', { method: 'POST' });
//       router.push('/login');
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <Head>
//         <title>Dashboard Admin</title>
//       </Head>

//       <header className={styles.header}>
//         <h1>🩺 Dashboard Administrasi</h1>
//         <p>Ringkasan statistik data responden terkini.</p>
//       </header>

//       <div className={styles.buttonGroup}>
//         <Link href="/" className={`${styles.button} ${styles.linkBlue}`}>
//           Isi Form
//         </Link>
//         <Link href="/admin/listdata" className={`${styles.button} ${styles.linkGreen}`}>
//           Lihat List Data
//         </Link>
//         <Link href="/api/export" className={`${styles.button} ${styles.linkDark}`}>
//           Export Excel
//         </Link>
//         <button onClick={handleLogout} className={`${styles.button} ${styles.linkRed}`}>
//           Logout
//         </button>
//       </div>

//       <section className={styles.statSection}>
//         <div style={{ 
//           marginBottom: '30px', 
//           padding: '20px', 
//           backgroundColor: '#f0f9ff',
//           borderLeft: '5px solid #0ea5e9',
//           borderRadius: '8px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
//         }}>
//           <h2 style={{ 
//             marginTop: 0, 
//             marginBottom: '15px', 
//             fontSize: '18px', 
//             fontWeight: 'bold',
//             color: '#0c4a6e'
//           }}>
//             ⚙️ Pengaturan Penyimpanan Data
//           </h2>
//           <p style={{ 
//             marginBottom: '15px', 
//             color: '#666',
//             fontSize: '14px',
//             fontWeight: '500'
//           }}>
//             Status : <strong style={{ 
//               color: enableSave ? '#10b981' : '#ef4444',
//               fontSize: '16px'
//             }}>
//               {enableSave ? 'AKTIF' : 'NONAKTIF'}
//             </strong>
//           </p>
//           <div style={{ 
//             display: 'flex', 
//             gap: '12px',
//             flexWrap: 'wrap'
//           }}>
//             <button
//               onClick={() => handleToggleSetting(true)}
//               disabled={loadingSetting || enableSave}
//               style={{
//                 padding: '12px 24px',
//                 backgroundColor: enableSave ? '#e5e7eb' : '#10b981',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '6px',
//                 cursor: enableSave || loadingSetting ? 'not-allowed' : 'pointer',
//                 fontWeight: '600',
//                 fontSize: '14px',
//                 opacity: enableSave || loadingSetting ? 0.6 : 1,
//                 transition: 'all 0.3s ease',
//                 boxShadow: enableSave ? 'none' : '0 2px 6px rgba(16, 185, 129, 0.3)',
//               }}
//               onMouseEnter={(e) => {
//                 if (!enableSave && !loadingSetting) {
//                   e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
//                   e.target.style.transform = 'translateY(-2px)';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.boxShadow = '0 2px 6px rgba(16, 185, 129, 0.3)';
//                 e.target.style.transform = 'translateY(0)';
//               }}
//             >
//               {loadingSetting ? '⏳ Memproses...' : 'AKTIFKAN'}
//             </button>
//             <button
//               onClick={() => handleToggleSetting(false)}
//               disabled={loadingSetting || !enableSave}
//               style={{
//                 padding: '12px 24px',
//                 backgroundColor: !enableSave ? '#e5e7eb' : '#ef4444',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '6px',
//                 cursor: !enableSave || loadingSetting ? 'not-allowed' : 'pointer',
//                 fontWeight: '600',
//                 fontSize: '14px',
//                 opacity: !enableSave || loadingSetting ? 0.6 : 1,
//                 transition: 'all 0.3s ease',
//                 boxShadow: !enableSave ? 'none' : '0 2px 6px rgba(239, 68, 68, 0.3)',
//               }}
//               onMouseEnter={(e) => {
//                 if (!loadingSetting && enableSave) {
//                   e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
//                   e.target.style.transform = 'translateY(-2px)';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.3)';
//                 e.target.style.transform = 'translateY(0)';
//               }}
//             >
//               {loadingSetting ? '⏳ Memproses...' : ' NONAKTIFKAN'}
//             </button>
//           </div>
//         </div>

//         <h2 className={styles.sectionTitle}>📈 Statistik Berdasarkan Kategori Risiko</h2>

//         <p className={styles.totalEntry}>
//           Total Keseluruhan Entri:
//           <strong className={styles.totalCount}>{stats.total}</strong>
//         </p>

//         <div className={styles.statsGrid}>
//           {labels.map((l) => {
//             const style = statStyling[l] || statStyling.Lainnya;
//             return (
//               <div
//                 key={l}
//                 className={styles.statCard}
//                 style={{
//                   borderLeftColor: style.color,
//                   borderLeftWidth: '5px',
//                   boxShadow: `0 4px 12px -2px rgba(0,0,0,0.1), 0 2px 4px -2px ${style.color}4d`,
//                   transition: 'all 0.3s ease',
//                   cursor: 'default',
//                   transform: 'translateY(0)',
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'translateY(-4px)';
//                   e.currentTarget.style.boxShadow = `0 8px 16px -2px rgba(0,0,0,0.15), 0 4px 8px -2px ${style.color}66`;
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'translateY(0)';
//                   e.currentTarget.style.boxShadow = `0 4px 12px -2px rgba(0,0,0,0.1), 0 2px 4px -2px ${style.color}4d`;
//                 }}
//               >
//                 <div className={styles.cardHeader}>
//                   <span className={styles.cardIcon} style={{ color: style.color, fontSize: '24px' }}>
//                     {style.icon}
//                   </span>
//                   <div className={styles.statLabel} style={{ fontWeight: '600', color: '#1f2937' }}>
//                     {l}
//                   </div>
//                 </div>
//                 <div className={styles.statValue} style={{ color: style.detailColor, fontSize: '28px', fontWeight: '700' }}>
//                   {stats.counts[l] ?? 0}
//                 </div>
//                 <div className={styles.statDetail} style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
//                    Rata-rata Skor: <strong>{stats.avgScores[l] ?? 0}</strong>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className={styles.chartContainer} style={{ 
//           marginTop: '30px',
//           padding: '20px',
//           backgroundColor: '#fff',
//           borderRadius: '8px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
//         }}>
//           <h3 className={styles.chartTitle} style={{ color: '#1f2937', marginBottom: '20px' }}>
//             📊 Distribusi Responden
//           </h3>
//           <Bar data={chartData} options={chartOptions} />
//         </div>
//       </section>
//     </div>
//   );
// }

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from '../styles/Admin.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const fetcher = (url) => fetch(url).then((r) => r.json());

const statStyling = {
  Rendah: { icon: '✅', color: '#10b981', lightColor: '#d1fae5', detailColor: '#047857' },
  Sedang: { icon: '⚠️', color: '#f59e0b', lightColor: '#fef3c7', detailColor: '#b45309' },
  Tinggi: { icon: '🚨', color: '#ef4444', lightColor: '#fee2e2', detailColor: '#b91c1c' },
  Lainnya: { icon: '❓', color: '#6b7280', lightColor: '#f3f4f6', detailColor: '#374151' },
};

export default function Admin() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [enableSave, setEnableSave] = useState(null);
  const [loadingSetting, setLoadingSetting] = useState(false);
  const [showNotification, setShowNotification] = useState(null);

  const { data: stats, error: statsErr } = useSWR(authenticated ? '/api/stats' : null, fetcher);
  const { data: listRes, error: listErr } = useSWR(authenticated ? '/api/list' : null, fetcher);

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.status === 200) {
          setAuthenticated(true);
        } else {
          router.push('/login');
          setAuthenticated(false);
        }
      } catch (err) {
        router.push('/login');
        setAuthenticated(false);
      }
      setAuthChecked(true);
    }
    checkLogin();
  }, [router]);

  useEffect(() => {
    async function fetchSetting() {
      try {
        const res = await fetch('/api/setting');
        const data = await res.json();
        setEnableSave(data.enablesimpan === 1);
      } catch (err) {
        console.error('Error fetching setting:', err);
      }
    }
    
    if (authenticated) {
      fetchSetting();
    }
  }, [authenticated]);

  const handleToggleSetting = async (newValue) => {
    setLoadingSetting(true);
    try {
      const res = await fetch('/api/setting', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enablesimpan: newValue ? 1 : 0 })
      });
      
      if (res.status === 200) {
        setEnableSave(newValue);
        setShowNotification({
          type: 'success',
          message: newValue ? '✅ Penyimpanan data DIAKTIFKAN' : '⛔ Penyimpanan data DINONAKTIFKAN'
        });
        setTimeout(() => setShowNotification(null), 3000);
      } else {
        setShowNotification({
          type: 'error',
          message: 'Gagal mengubah pengaturan'
        });
      }
    } catch (err) {
      console.error('Error updating setting:', err);
      setShowNotification({
        type: 'error',
        message: 'Terjadi kesalahan'
      });
    } finally {
      setLoadingSetting(false);
    }
  };

  if (!authChecked) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>⏳ Memeriksa akses...</p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }
  
  if (statsErr || listErr)
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.errorText}>❌ Error loading data</p>
      </div>
    );

  if (!stats || !listRes)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>⏳ Loading...</p>
      </div>
    );

  const labels = stats.labels;
  const counts = labels.map((l) => stats.counts[l] ?? 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Jumlah Responden',
        data: counts,
        borderWidth: 2,
        backgroundColor: [
          '#d1fae5',
          '#fef3c7',
          '#fee2e2',
          '#f3f4f6'
        ],
        borderColor: [
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#6b7280'
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          font: { size: 12, weight: '500' },
          padding: 20,
          usePointStyle: true,
        }
      },
      title: { display: false },
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: { stepSize: 1 }
      },
    },
  };

  const doughnutData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
        borderColor: ['#fff'],
        borderWidth: 3,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12, weight: '500' },
          padding: 15,
          usePointStyle: true,
        }
      },
    },
  };

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    }
  };

  const totalResponden = stats.total;
  const percentageByRisk = labels.reduce((acc, label) => {
    acc[label] = ((stats.counts[label] ?? 0) / totalResponden * 100).toFixed(1);
    return acc;
  }, {});

  return (
    
    <div className={styles.pageContainer}>
      <Head>
        <title>Dashboard Admin - Sistem Penilaian Risiko Infeksi</title>
      </Head>

      {showNotification && (
        <div className={`${styles.notification} ${styles[showNotification.type]}`}>
          {showNotification.message}
        </div>
      )}

      <header className={styles.heroHeader}>
        <div className={styles.heroContent}>
          <br></br>
          <br></br>
          {/* <div className={styles.heroIcon}>📊</div> */}
          <h1 className={styles.heroTitle}>Dashboard Administrasi</h1>
          <p className={styles.heroSubtitle}>Ringkasan Statistik & Analisis Data Responden</p>
        </div>
      </header>

      <nav className={styles.navButtons}>
        <Link href="/" className={`${styles.navButton} ${styles.navButtonBlue}`}>
          {/* <span className={styles.navButtonIcon}>📝</span> */}
          Isi Form
        </Link>
        <Link href="/admin/listdata" className={`${styles.navButton} ${styles.navButtonGreen}`}>
          {/* <span className={styles.navButtonIcon}>📋</span> */}
          Lihat List Data
        </Link>
        <Link href="/api/export" className={`${styles.navButton} ${styles.navButtonPurple}`}>
          {/* <span className={styles.navButtonIcon}>📥</span> */}
          Export Excel
        </Link>
        <button onClick={handleLogout} className={`${styles.navButton} ${styles.navButtonRed}`}>
          {/* <span className={styles.navButtonIcon}>🚪</span> */}
          Logout
        </button>
      </nav>

      <main className={styles.mainContent}>

        <section className={styles.settingsSection}>
          <div className={styles.settingsCard}>
            <div className={styles.settingsHeader}>
              <h2 className={styles.settingsTitle}>Pengaturan Penyimpanan Data</h2>
              <div className={`${styles.statusBadge} ${enableSave ? styles.statusActive : styles.statusInactive}`}>
                {enableSave ? '🟢 AKTIF' : '🔴 NONAKTIF'}
              </div>
            </div>

            <p className={styles.settingsDescription}>
              Kelola pengaturan penyimpanan data responden ke database. Aktifkan untuk mulai menyimpan data baru.
            </p>

            <div className={styles.settingsButtonGroup}>
              <button
                onClick={() => handleToggleSetting(true)}
                disabled={loadingSetting || enableSave}
                className={`${styles.settingsButton} ${styles.settingsButtonActive} ${enableSave || loadingSetting ? styles.settingsButtonDisabled : ''}`}
              >
                <span className={styles.settingsButtonIcon}>✓</span>
                {loadingSetting ? 'Memproses...' : 'AKTIFKAN'}
              </button>
              <button
                onClick={() => handleToggleSetting(false)}
                disabled={loadingSetting || !enableSave}
                className={`${styles.settingsButton} ${styles.settingsButtonInactive} ${!enableSave || loadingSetting ? styles.settingsButtonDisabled : ''}`}
              >
                <span className={styles.settingsButtonIcon}>✕</span>
                {loadingSetting ? 'Memproses...' : 'NONAKTIFKAN'}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.overviewSection}>
          <h2 className={styles.sectionTitle}>Ringkasan Statistik</h2>
          
          <div className={styles.overviewGrid}>
            <div className={styles.overviewCard}>
              <div className={styles.overviewCardContent}>
                <p className={styles.overviewLabel}>Total Responden</p>
                <p className={styles.overviewValue}>{totalResponden}</p>
              </div>
              {/* <div className={styles.overviewCardIcon}>📊</div> */}
            </div>

            {labels.map((label) => {
              const style = statStyling[label] || statStyling.Lainnya;
              return (
                <div key={label} className={styles.overviewCard} style={{ borderTopColor: style.color }}>
                  <div className={styles.overviewCardContent}>
                    <p className={styles.overviewLabel}>{label}</p>
                    <p className={styles.overviewValue} style={{ color: style.color }}>
                      {stats.counts[label] ?? 0}
                    </p>
                    <p className={styles.overviewSubtext}>
                      {percentageByRisk[label]}% dari total
                    </p>
                  </div>
                  {/* <div className={styles.overviewCardIcon} style={{ fontSize: '32px' }}>
                    {style.icon}
                  </div> */}
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.detailedStatsSection}>
          <h2 className={styles.sectionTitle}>Analisis Terperinci</h2>
          
          <div className={styles.statsCardsGrid}>
            {labels.map((l) => {
              const style = statStyling[l] || statStyling.Lainnya;
              const count = stats.counts[l] ?? 0;
              const percentage = percentageByRisk[l];
              const avgScore = stats.avgScores[l] ?? 0;
              
              return (
                <div
                  key={l}
                  className={styles.detailedStatCard}
                  style={{ borderTopColor: style.color, backgroundColor: style.lightColor + '33' }}
                >
                  <div className={styles.detailedStatCardHeader}>
                    {/* <span className={styles.detailedStatIcon} style={{ color: style.color }}>
                      {style.icon}
                    </span> */}
                    <h3 className={styles.detailedStatLabel} style={{ color: style.detailColor }}>
                      Risiko {l}
                    </h3>
                  </div>

                  <div className={styles.detailedStatContent}>
                    <div className={styles.detailedStatMetric}>
                      <span className={styles.metricLabel}>Jumlah</span>
                      <span className={styles.metricValue} style={{ color: style.color }}>
                        {count}
                      </span>
                    </div>

                    <div className={styles.detailedStatMetric}>
                      <span className={styles.metricLabel}>Persentase</span>
                      <span className={styles.metricValue} style={{ color: style.color }}>
                        {percentage}%
                      </span>
                    </div>

                    <div className={styles.detailedStatMetric}>
                      <span className={styles.metricLabel}>Rata-rata Skor</span>
                      <span className={styles.metricValue} style={{ color: style.detailColor }}>
                        {parseFloat(avgScore).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: style.color
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        <section className={styles.chartsSection}>
          <div className={styles.chartsGrid}>
            <div className={styles.chartBox}>
              <h3 className={styles.chartTitle}> Distribusi Responden</h3>
              <div className={styles.chartWrapper}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className={styles.chartBox}>
              <h3 className={styles.chartTitle}> Proporsi Risiko</h3>
              <div className={styles.chartWrapper}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </section>

        {/* <section className={styles.infoSection}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon}>💡</div>
              <h4 className={styles.infoCardTitle}>Tips Penggunaan</h4>
              <p className={styles.infoCardText}>
                Gunakan dashboard ini untuk memantau data responden dan membuat keputusan berdasarkan statistik yang tersedia.
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon}>📊</div>
              <h4 className={styles.infoCardTitle}>Sumber Data</h4>
              <p className={styles.infoCardText}>
                Semua data berasal dari responden yang telah mengisi formulir penilaian risiko infeksi.
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon}>🔐</div>
              <h4 className={styles.infoCardTitle}>Keamanan</h4>
              <p className={styles.infoCardText}>
                Data tersimpan aman dengan kontrol akses berbasis role admin untuk keamanan maksimal.
              </p>
            </div>
          </div>
        </section> */}

      </main>

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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}