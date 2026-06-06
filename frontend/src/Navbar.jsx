import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, List, Heart, ShoppingBag, User, LogOut, Store } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const navItems = [
    { path: '/browse-listings', label: 'Browse Listings', icon: Search },
    { path: '/my-listings', label: 'My Listings', icon: List },
    { path: '/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/orders-history', label: 'Orders', icon: ShoppingBag },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => {
    if (path === '/browse-listings') {
      return location.pathname === '/browse-listings' || location.pathname === '/search-items';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container">
        <Link className="navbar-brand brand-text" to="/browse-listings">
          <Store className="brand-icon me-2" size={28} />
          <span>Loopify</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <Link
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    to={item.path}
                  >
                    <Icon className="nav-icon" size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}

            <li className="nav-item ms-2">
              <button className="btn btn-logout" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
