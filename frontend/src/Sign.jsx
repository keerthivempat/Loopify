import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import logo from './assets/logo.png';
import './Login.css';

const Sign = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    age: '', contactNumber: '', password: '', confirmPassword: ''
  });
  const [captchaValue, setCaptchaValue] = useState(null);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [showPwd,    setShowPwd]    = useState(false);
  const [showConfirm,setShowConfirm]= useState(false);
  const navigate = useNavigate();
  const RECAPTCHA_SITE_KEY = "6LcqOssqAAAAAE9ili7h648pENbzfiUVRVi2rVQs";

  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!captchaValue) { setError('Please complete the reCAPTCHA verification'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        age: formData.age,
        contactNumber: formData.contactNumber,
        password: formData.password,
        recaptchaToken: captchaValue
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className="auth-hero-title">Your next<br />great find<br />is here</h1>
          <p className="auth-hero-sub">
            Join thousands of buyers and sellers in your community. List items in minutes, sell within days.
          </p>
          <div className="auth-hero-stats">
            <div className="auth-stat"><span>Free</span><small>To list</small></div>
            <div className="auth-stat"><span>Fast</span><small>Delivery</small></div>
            <div className="auth-stat"><span>Safe</span><small>Payments</small></div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-wrap fade-up">
          <h2 className="auth-form-title">Create account</h2>
          <p className="auth-form-sub">Join the Loopify community today</p>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success">
              <CheckCircle2 size={16} />
              Account created! Redirecting to sign in…
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="firstName" className="auth-label">First name</label>
                <input id="firstName" name="firstName" type="text"
                  className="lp-input" placeholder="Jane"
                  value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="auth-field">
                <label htmlFor="lastName" className="auth-label">Last name</label>
                <input id="lastName" name="lastName" type="text"
                  className="lp-input" placeholder="Doe"
                  value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email address</label>
              <input id="email" name="email" type="email"
                className="lp-input" placeholder="you@example.com"
                value={formData.email} onChange={handleChange} required />
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="age" className="auth-label">Age</label>
                <input id="age" name="age" type="number"
                  className="lp-input" placeholder="22"
                  value={formData.age} onChange={handleChange} required />
              </div>
              <div className="auth-field">
                <label htmlFor="contactNumber" className="auth-label">Phone</label>
                <input id="contactNumber" name="contactNumber" type="tel"
                  className="lp-input" placeholder="+91 XXXXX XXXXX"
                  value={formData.contactNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Password</label>
              <div className="auth-pwd-wrap">
                <input id="password" name="password" type={showPwd ? 'text' : 'password'}
                  className="lp-input" placeholder="Min. 8 characters"
                  value={formData.password} onChange={handleChange} required />
                <button type="button" className="auth-eye" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword" className="auth-label">Confirm password</label>
              <div className="auth-pwd-wrap">
                <input id="confirmPassword" name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  className="lp-input" placeholder="Repeat password"
                  value={formData.confirmPassword} onChange={handleChange} required />
                <button type="button" className="auth-eye" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={setCaptchaValue} />
            </div>

            <button type="submit" className="lp-btn lp-btn-primary auth-submit" disabled={loading || success}>
              {loading ? <span className="auth-spinner" /> : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <button className="auth-switch-btn" onClick={() => navigate('/login')}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sign;