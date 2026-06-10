import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, Edit2, LogOut, Save, X,
  ShoppingBag, Heart, Package,
} from 'lucide-react';
import Navbar from './Navbar';
import logo from './assets/logo.png';
import './Profile.css';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const authHdr = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const Profile = () => {
  const [profile,   setProfile]   = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData,  setFormData]  = useState({
    firstName: '', lastName: '', email: '', age: '', contactNumber: '',
  });
  const [stats,   setStats]   = useState({ listings: 0, wishlist: 0 });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/', { replace: true }); return; }

    const fetchAll = async () => {
      try {
        const [profileRes, listingsRes, wishlistRes] = await Promise.allSettled([
          axios.get(`${API}/profile`,     { headers: authHdr() }),
          axios.get(`${API}/my-listings`, { headers: authHdr() }),
          axios.get(`${API}/wishlist`,    { headers: authHdr() }),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data);
          setFormData(profileRes.value.data);
        } else {
          localStorage.removeItem('token');
          navigate('/', { replace: true });
          return;
        }

        setStats({
          listings: listingsRes.status === 'fulfilled' ? listingsRes.value.data.length : 0,
          wishlist: wishlistRes.status === 'fulfilled' ? wishlistRes.value.data.length : 0,
        });
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${API}/profile`, formData, { headers: authHdr() });
      setProfile(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="lp-page">
      <Navbar />
      <div className="profile-loading"><div className="profile-loading-spinner" /></div>
    </div>
  );

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="lp-page">
      <Navbar />

      <div className="profile-container">

        {/* ── Header card ── */}
        <div className="profile-header-card lp-card">
          <div className="profile-brand">
            <img src={logo} alt="Loopify" className="profile-brand-logo" />
          </div>
          <div className="profile-avatar-lg">{initials}</div>
          <h1 className="profile-name">{profile.firstName} {profile.lastName}</h1>
          <p className="profile-since">
            {memberSince ? `Member since ${memberSince}` : 'Loopify Member'}
          </p>
          <div className="profile-actions-top">
            {!isEditing && (
              <button className="lp-btn lp-btn-outline" onClick={() => setIsEditing(true)}>
                <Edit2 size={15} /> Edit Profile
              </button>
            )}
            <button className="lp-btn lp-btn-ghost" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="profile-stats">
          <div className="profile-stat-card">
            <Package size={22} className="profile-stat-icon" />
            <span className="profile-stat-val">{stats.listings}</span>
            <span className="profile-stat-label">Listings</span>
          </div>
          <div className="profile-stat-card">
            <Heart size={22} className="profile-stat-icon" />
            <span className="profile-stat-val">{stats.wishlist}</span>
            <span className="profile-stat-label">Wishlisted</span>
          </div>
          <div className="profile-stat-card">
            <ShoppingBag size={22} className="profile-stat-icon" />
            <span className="profile-stat-val">{stats.listings > 0 ? Math.round(stats.listings * 0.6) : 0}</span>
            <span className="profile-stat-label">Est. Views</span>
          </div>
        </div>

        {/* ── Account Details / Edit form ── */}
        <div className="profile-card lp-card">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <h3 className="lp-section-title">Edit Profile</h3>
              <div className="profile-form-row">
                <div className="profile-form-field">
                  <label className="auth-label">First name</label>
                  <input name="firstName" type="text" className="lp-input"
                    value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="profile-form-field">
                  <label className="auth-label">Last name</label>
                  <input name="lastName" type="text" className="lp-input"
                    value={formData.lastName} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="profile-form-field">
                <label className="auth-label">Email address</label>
                <input name="email" type="email" className="lp-input"
                  value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="profile-form-row">
                <div className="profile-form-field">
                  <label className="auth-label">Age</label>
                  <input name="age" type="number" className="lp-input"
                    value={formData.age} onChange={handleInputChange} />
                </div>
                <div className="profile-form-field">
                  <label className="auth-label">Contact number</label>
                  <input name="contactNumber" type="text" className="lp-input"
                    value={formData.contactNumber} onChange={handleInputChange} />
                </div>
              </div>
              <div className="profile-form-actions">
                <button type="submit" className="lp-btn lp-btn-primary" disabled={saving}>
                  {saving ? <span className="auth-spinner" /> : <><Save size={15} /> Save Changes</>}
                </button>
                <button type="button" className="lp-btn lp-btn-ghost"
                  onClick={() => { setFormData(profile); setIsEditing(false); }}>
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-list">
              <h3 className="lp-section-title">Account Details</h3>
              {[
                { icon: User,     label: 'Full name', value: `${profile.firstName} ${profile.lastName}` },
                { icon: Mail,     label: 'Email',     value: profile.email },
                { icon: Calendar, label: 'Age',       value: profile.age ? `${profile.age} years old` : '—' },
                { icon: Phone,    label: 'Phone',     value: profile.contactNumber || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="profile-info-row">
                  <div className="profile-info-icon"><Icon size={16} /></div>
                  <div>
                    <div className="profile-info-label">{label}</div>
                    <div className="profile-info-value">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
