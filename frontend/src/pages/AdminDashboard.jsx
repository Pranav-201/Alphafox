import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import Alert from '../components/Alert';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        client.get('/admin/stats'),
        client.get('/admin/users', { params: { page, limit: 10 } }),
      ]);
      setStats(sRes.data.data);
      setUsers(uRes.data.data.items);
      setMeta(uRes.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await client.delete(`/admin/users/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <Alert type="error" message={error} />

      {stats && (
        <div className="stats-grid">
          <div className="card stat">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats.userCount}</span>
          </div>
          <div className="card stat">
            <span className="stat-label">Total Portfolios</span>
            <span className="stat-value">{stats.portfolioCount}</span>
          </div>
          <div className="card stat">
            <span className="stat-label">Total Assets</span>
            <span className="stat-value">{stats.assetCount}</span>
          </div>
        </div>
      )}

      <h2>All Users</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="btn-danger small" onClick={() => deleteUser(u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {meta.pages > 1 && (
        <div className="row pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {meta.page} of {meta.pages}
          </span>
          <button disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
