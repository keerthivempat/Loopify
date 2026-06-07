import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { List, Heart, MessageSquare, User, LogOut, Plus, X, Menu } from 'lucide-react';
import logo from './assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);

  const token = localStorage.getItem('token');
  const isAuth = !!token;

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    const handler = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path) => {
    if (path === '/browse-listings') return location.pathname === '/browse-listings' || location.pathname === '/search-items';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navLinks = [
    { path: '/browse-listings', label: 'Browse',   icon: null  },
    { path: '/my-listings',     label: 'Listings', icon: List  },
    { path: '/wishlist',        label: 'Wishlist', icon: Heart },
    { path: '/orders-history',  label: 'Orders',   icon: MessageSquare },
  ];

  return (
    <nav className="lp-navbar">
      <div className="lp-navbar-inner">

        {/* ── Brand / Logo ── */}
        <Link to={isAuth ? '/browse-listings' : '/'} className="lp-brand">
          <img src={logo} alt="Loopify" className="lp-brand-logo" />
        </Link>

        {isAuth ? (
          <>
            {/* ── Authenticated: desktop nav links ── */}
            <div className="lp-nav-links">
              {navLinks.map(({ path, label }) => (
                <Link key={path} to={path} className={`lp-nav-link ${isActive(path) ? 'active' : ''}`}>
                  <span>{label}</span>
                </Link>
              ))}

              {/* Sell CTA */}
              <Link to="/create-listing" className="lp-btn-create">
                <Plus size={15} />
                <span>Sell</span>
              </Link>

              {/* Avatar dropdown */}
              <div className="lp-avatar-wrap" ref={avatarRef}>
                <button
                  id="avatar-btn"
                  className="lp-avatar-btn"
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  aria-label="User menu"
                >
                  {initials}
                </button>
                {avatarOpen && (
                  <div className="lp-avatar-dropdown">
                    <div className="lp-avatar-header">
                      <div className="lp-avatar-name">{user.firstName} {user.lastName}</div>
                      <div className="lp-avatar-email">{user.email}</div>
                    </div>
                    <hr className="lp-avatar-divider" />
                    <Link to="/profile" className="lp-avatar-item" onClick={() => setAvatarOpen(false)}>
                      <User size={15} /> Profile
                    </Link>
                    <button className="lp-avatar-item lp-avatar-logout" onClick={handleLogout}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Mobile hamburger ── */}
            <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </>
        ) : (
          /* ── Unauthenticated: Login / Register ── */
          <div className="lp-nav-links">
            <Link
              to="/"
              className={`lp-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/login"
              className={`lp-nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Login
            </Link>
            <Link to="/register" className="lp-btn-create">
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Mobile menu (authenticated only) ── */}
      {isAuth && menuOpen && (
        <div className="lp-mobile-menu">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path} to={path}
              className={`lp-mobile-link ${isActive(path) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {Icon && <Icon size={18} />} {label}
            </Link>
          ))}
          <Link to="/create-listing" className="lp-mobile-link accent" onClick={() => setMenuOpen(false)}>
            <Plus size={18} /> Sell an Item
          </Link>
          <Link to="/profile" className="lp-mobile-link" onClick={() => setMenuOpen(false)}>
            <User size={18} /> Profile
          </Link>
          <button className="lp-mobile-link danger" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
