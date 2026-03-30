import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/List.module.css';

const fetcher = (url) => fetch(url).then(r => r.json());

const ITEMS_PER_PAGE = 10;

const RiskBadge = ({ level }) => {
  let className = styles.riskBadge;

  if (level === 'Tinggi') className += ` ${styles.highRisk}`;
  else if (level === 'Sedang') className += ` ${styles.mediumRisk}`;
  else if (level === 'Rendah') className += ` ${styles.lowRisk}`;

  return <span className={className}>{level}</span>;
};

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>

        <div className={styles.modalButtons}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={styles.modalButtonCancel}
          >
            Tidak
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={styles.modalButtonConfirm}
          >
            {isLoading ? '⏳ Menghapus...' : ' Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminList() {
  const router = useRouter();
  
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
    isLoading: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
  
  if (!authChecked) {
    return <div className={styles.loadingContainer}><p>Memeriksa akses...</p></div>;
  }
  
  if (!authenticated) {
    return null;
  }

  const openDeleteModal = (id) => {
    setConfirmModal({
      isOpen: true,
      id,
      isLoading: false,
    });
  };

  const closeDeleteModal = () => {
    setConfirmModal({
      isOpen: false,
      id: null,
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    const { id } = confirmModal;
    
    setConfirmModal(prev => ({ ...prev, isLoading: true }));

    try {
      const cacheKey = '/api/list';

      await mutate(cacheKey, current => {
        if (!current) return current;
        return { ...current, rows: current.rows.filter(r => r.id !== id) };
      }, { revalidate: false, optimisticData: undefined });

      const res = await fetch(`/api/delete/${id}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        await mutate(cacheKey);
        alert('Gagal menghapus: ' + (body?.message || res.status));
        closeDeleteModal();
        return;
      }

      alert('Data ID ' + id + ' berhasil dihapus.');
      mutate(cacheKey);
      closeDeleteModal();

    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus.');
      mutate('/api/list');
      closeDeleteModal();
    }
  };

  if (listErr) return <div className={styles.loadingContainer}><p>Error: Gagal memuat data.</p></div>;
  if (!listRes) return <div className={styles.loadingContainer}><p>Memuat data...</p></div>;

  const filteredRows = listRes.rows?.filter(r => 
    r.nama_penyintas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toString().includes(searchQuery) ||
    r.usia.toString().includes(searchQuery)
  ) || [];

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRows = filteredRows.slice(startIndex, endIndex);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={styles.pageBackground}>
      <Head>
        <title>Data Responden - Admin</title>
      </Head>

      <div className={styles.pageContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Daftar Data Responden</h1>
          <p className={styles.pageSubtitle}>Kelola dan Monitor Data Penelitian</p>

          <div className={styles.actions}>
            <Link href="/admin" className={styles.buttonSecondary}>
              ← Kembali ke Dashboard
            </Link>
            <Link href="/api/export" className={styles.buttonPrimary}> 
              Export ke Excel
            </Link>
          </div>
        </div>

        <div className={styles.contentCard}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari berdasarkan Nama, ID, atau Usia..."
              value={searchQuery}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tanggal</th>
                  <th>Nama</th>
                  <th>Usia</th>
                  <th className={styles.centerText}>Total Skor</th>
                  <th className={styles.centerText}>Level Risiko</th>
                  <th className={styles.centerText}>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.id}</strong></td>
                      <td>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                      <td>{r.nama_penyintas}</td>
                      <td>{r.usia} tahun</td>
                      <td className={styles.centerText}><strong>{r.total_score}</strong></td>
                      <td className={styles.centerText}>
                        <RiskBadge level={r.risk_level} />
                      </td>
                      <td className={styles.centerText}>
                        <a
                          href={`/api/report/${r.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.actionLink}
                          title="Buka laporan PDF"
                        >
                          Show PDF
                        </a>
                        <button
                          onClick={() => openDeleteModal(r.id)}
                          className={styles.deleteButton}
                          title="Hapus data ini"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className={styles.emptyState}>
                       Tidak ada data yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.paginationContainer}>
            <p className={styles.paginationInfo}>
              Menampilkan <strong>{startIndex + 1}</strong> - <strong>{Math.min(endIndex, filteredRows.length)}</strong> dari <strong>{filteredRows.length}</strong> data
            </p>

            <div className={styles.paginationControls}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                ← Sebelumnya
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`${styles.pageButton} ${currentPage === page ? styles.pageButtonActive : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Selanjutnya →
              </button>
            </div>
          </div>
          <div className={styles.contentFooter}>
            <p className={styles.footerNote}>
              Total: <strong>{listRes.rows.length}</strong> entri | Hasil Pencarian: <strong>{filteredRows.length}</strong> entri
            </p>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title="Konfirmasi Penghapusan"
        message={`Apakah Anda yakin ingin menghapus data ID ${confirmModal.id}? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        isLoading={confirmModal.isLoading}
      />

      <style global jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}