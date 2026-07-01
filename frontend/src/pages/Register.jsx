import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import logo from '../assets/logo.png';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
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
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-simple auth-page-register">
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
            <span className="auth-eyebrow">Join AlphaFox</span>
            <h2>Create your account</h2>
            <p>Set up your portfolio workspace in a few quick steps.</p>
          </div>

          <Alert type="error" message={error} />

          <div className="auth-field">
            <label>Name</label>
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

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
              minLength={6}
              placeholder="Create a password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <button className="auth-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Register'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}