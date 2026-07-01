import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import logo from '../assets/logo.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-simple auth-page-login">
      <div className="auth-bg-orb auth-bg-orb-left" aria-hidden="true"></div>
      <div className="auth-bg-orb auth-bg-orb-right" aria-hidden="true"></div>

      <div className="auth-shell">
        <button className="auth-back-link auth-back-link-floating" onClick={() => navigate('/')} type="button">
          ← Back to Home
        </button>

        <div className="auth-logo-wrap">
          <img src={logo} alt="AlphaFox" className="auth-logo" />
        </div>

        <form className="auth-form-panel glass-panel auth-form-simple" onSubmit={submit}>
          <div className="auth-form-header auth-form-header-centered">
            <span className="auth-eyebrow">Secure access</span>
            <h2>Welcome back</h2>
            <p>Sign in to continue to your portfolio dashboard.</p>
          </div>

          <Alert type="error" message={error} />

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <button className="auth-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="auth-switch">
            No account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}