import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Alert from '../components/Alert';

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/portfolios');
      setPortfolios(data.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createPortfolio = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await client.post('/portfolios', { name, description });
      setName('');
      setDescription('');
      setSuccess('Portfolio created!');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create portfolio');
    }
  };

  const removePortfolio = async (id) => {
    if (!confirm('Delete this portfolio and all its assets info?')) return;
    try {
      await client.delete(`/portfolios/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete portfolio');
    }
  };

  return (
    <div className="page">
      <h1>Your Portfolios</h1>
      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      <form className="card inline-form" onSubmit={createPortfolio}>
        <input
          placeholder="Portfolio name e.g. Long Term Portfolio"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="btn-primary">+ Create</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : portfolios.length === 0 ? (
        <p className="muted">No portfolios yet. Create your first one above.</p>
      ) : (
        <div className="grid">
          {portfolios.map((p) => (
            <div className="card portfolio-card" key={p._id}>
              <h3>{p.name}</h3>
              <p className="muted">{p.description || 'No description'}</p>
              <div className="row">
                <Link to={`/portfolios/${p._id}`} className="btn-secondary">
                  View Details
                </Link>
                <button className="btn-danger" onClick={() => removePortfolio(p._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
