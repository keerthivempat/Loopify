import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logo from './assets/logo.png';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [stats,    setStats]    = useState({ listings: null, users: null, wishlistSavers: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://loopify-pl69.onrender.com/api/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setStats({
        listings:       data.listings      ?? null,
        users:          data.users         ?? null,
        wishlistSavers: data.wishlistSavers ?? null,
      }))
      .catch(() => {/* keep nulls — fallback labels shown */});
  }, []);

  const fmt = (n) => n === null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(1)}K+` : `${n}+`;

  const handleChange = (e) => {
    setError(''); // clear error as user types
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('https://loopify-pl69.onrender.com/api/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/browse-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left hero panel ── */}
      <div className="auth-hero">
        <div className="auth-hero-inner">
          <div className="auth-logo">
            <img src={logo} alt="Loopify" className="auth-logo-img" />
          </div>
          <h1 className="auth-hero-title">Buy and sell<br />things you love</h1>
          <p className="auth-hero-sub">
            A trusted marketplace for second-hand items in your community.
          </p>
          <div className="auth-hero-stats">
            <div className="auth-stat"><span>{fmt(stats.listings)}</span><small>Listings</small></div>
            <div className="auth-stat"><span>{fmt(stats.users)}</span><small>Members</small></div>
            <div className="auth-stat"><span>{fmt(stats.wishlistSavers)}</span><small>Wishlisters</small></div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-wrap fade-up">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-sub">Sign in to your Loopify account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                className="lp-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password" className="auth-label">Password</label>
              <div className="auth-pwd-wrap">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  className="lp-input"
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="auth-eye" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="lp-btn lp-btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button className="auth-switch-btn" onClick={() => navigate('/register')}>Create account</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;