// pages/admin.js
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(r=>r.json());

export default function Admin() {
  const { data, error } = useSWR('/api/list', fetcher);

  if (error) return <div>Error loading</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div style={{maxWidth:1000, margin:'2rem auto', fontFamily:'system-ui'}}>
      <h1>Daftar Respon</h1>
      <table border="1" cellPadding="6" style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th>ID</th><th>Nama</th><th>Usia</th><th>Total</th><th>Risk</th><th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.nama_penyintas}</td>
              <td>{r.usia}</td>
              <td>{r.total_score}</td>
              <td>{r.risk_level}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
