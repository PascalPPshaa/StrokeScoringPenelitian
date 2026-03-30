import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'; 
import styles from '../styles/Login.module.css'; 


const LoadingSpinner = () => (
    <svg 
        className={styles.spinner}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth="2"
    >
        <circle cx="12" cy="12" r="10" stroke="currentColor" style={{ opacity: 0.25 }} />
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(''); 

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || '❌ Login gagal. Silakan coba lagi.');
      }
    } catch (err) {
      setError('❌ Terjadi kesalahan jaringan atau server.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Login Admin - Dashboard</title>
        <meta name="description" content="Halaman Login untuk Dashboard Admin" />
      </Head>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.icon}>🔐</span>
          <h1 className={styles.title}>Login Admin</h1>
          <p className={styles.subtitle}>Akses Dashboard Administrasi</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              👤 Username
            </label>
            <input
              type="text"
              id="username"
              className={styles.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              aria-label="Username"
              autoComplete="username" 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              🔑 Password
            </label>
            <div className={styles.passwordField}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                aria-label="Password"
                autoComplete="current-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Sedang Login...</span>
              </>
            ) : (
              <>
                {/* <span>🔓</span> */}
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Section */}
        <div className={styles.footer}>
          <p className={styles.footerTitle}>Dashboard Penelitian Stroke Scoring</p>
          <p className={styles.footerCopyright}>© 2026 - Universitas Muhammadiyah Yogyakarta</p>
        </div>
      </div>

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