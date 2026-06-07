import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import Navbar from './Navbar';
import ListingCard from './components/ListingCard';
import Toast from './components/Toast';
import { API_BASE, getAuthHeaders } from './utils/api';
import './SearchItems.css';

const Wishlist = () => {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });
  const hideToast = () => setToast(t => ({ ...t, show: false }));

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(`${API_BASE}/wishlist`, { headers: getAuthHeaders() });
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch {
        showToast('Failed to load wishlist', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from your wishlist?`)) return;
    try {
      await axios.delete(`${API_BASE}/wishlist/${item._id}`, { headers: getAuthHeaders() });
      setItems(prev => prev.filter(i => i._id !== item._id));
      showToast('Removed from wishlist');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove from wishlist', 'error');
    }
  };

  return (
    <div className="lp-page">
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="browse-container">
        <div className="wishlist-header">
          <div className="wishlist-heading">
            <Heart size={26} className="wishlist-icon" />
            <h1>Wishlist</h1>
          </div>
          <p className="wishlist-sub">Items you've saved for later</p>
        </div>

        {loading ? (
          <div className="lp-listings-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="lp-skeleton-card">
                <div className="skeleton lp-skeleton-img" />
                <div className="lp-skeleton-body">
                  <div className="skeleton lp-skeleton-line w-full" />
                  <div className="skeleton lp-skeleton-line w-60" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="lp-listings-grid">
            {items.map(item => (
              <ListingCard
                key={item._id}
                item={item}
                showSeller
                showStatusBadge
                onRemoveFromWishlist={handleRemoveFromWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="lp-empty">
            <Heart size={56} />
            <h3>Your wishlist is empty</h3>
            <p>Browse listings and heart items you like to save them here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
