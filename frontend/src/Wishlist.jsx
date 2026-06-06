import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import Navbar from './Navbar';
import ListingCard from './components/ListingCard';
import Toast from './components/Toast';
import { API_BASE, getAuthHeaders } from './utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SearchItems.css';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/wishlist`, { headers: getAuthHeaders() });
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setItems([]);
      showToast('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (item) => {
    try {
      await axios.delete(`${API_BASE}/wishlist/${item._id}`, { headers: getAuthHeaders() });
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      showToast('Removed from wishlist');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to remove from wishlist', 'error');
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="container py-5">
        <div className="browse-header mb-4">
          <div className="d-flex align-items-center gap-2">
            <Heart size={28} className="text-danger" />
            <h2 className="browse-title mb-0">Wishlist</h2>
          </div>
          <p className="text-muted mb-0 mt-1">Items you&apos;ve saved for later</p>
        </div>

        <div className="row">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">Loading wishlist...</p>
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <ListingCard
                key={item._id}
                item={item}
                showSeller
                showStatusBadge
                onRemoveFromWishlist={handleRemoveFromWishlist}
              />
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <Heart size={48} className="text-muted mb-3" />
              <p className="text-muted">Your wishlist is empty. Browse listings and save items you like!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
