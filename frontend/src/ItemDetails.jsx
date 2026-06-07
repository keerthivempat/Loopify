import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Tag, User, AlertTriangle,
  Mail, Pencil, Trash2, CheckCircle2,
} from 'lucide-react';
import Navbar from './Navbar';
import Toast from './components/Toast';
import ContactSellerModal from './components/ContactSellerModal';
import WishlistButton from './components/WishlistButton';
import { API_BASE, getAuthHeaders, getCurrentUser } from './utils/api';
import './ItemDetails.css';

const ItemDetails = () => {
  const [item,             setItem]             = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isWishlisted,     setIsWishlisted]     = useState(false);
  const [actionLoading,    setActionLoading]    = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });
  const hideToast = () => setToast(t => ({ ...t, show: false }));

  const isOwner = item && currentUser && (
    item.sellerId?.toString() === currentUser.id?.toString() ||
    item.createdBy?.toString() === currentUser.id?.toString()
  );
  const isSold = item?.status === 'sold';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [itemRes, wishlistRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/items/${id}`),
          axios.get(`${API_BASE}/wishlist`, { headers: getAuthHeaders() }),
        ]);
        if (itemRes.status === 'fulfilled') {
          setItem(itemRes.value.data);
        } else {
          setError('Item not found');
        }
        if (wishlistRes.status === 'fulfilled') {
          const ids = wishlistRes.value.data.map(w => w._id);
          setIsWishlisted(ids.includes(id));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleMarkSold = async () => {
    if (!window.confirm(`Mark "${item.name}" as sold?`)) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(`${API_BASE}/items/${id}/mark-sold`, {}, { headers: getAuthHeaders() });
      setItem(res.data);
      showToast('Listing marked as sold');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to mark as sold', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/items/${id}`, { headers: getAuthHeaders() });
      showToast('Listing deleted');
      setTimeout(() => navigate('/my-listings'), 1000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error');
      setActionLoading(false);
    }
  };

  const handleWishlistToggle = (_id, wishlisted, errMsg) => {
    if (errMsg) { showToast(errMsg, 'error'); return; }
    setIsWishlisted(wishlisted);
    showToast(wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="lp-page">
      <Navbar />
      <div className="id-container">
        <div className="id-skeleton-back skeleton" style={{ width: 120, height: 20, borderRadius: 6 }} />
        <div className="id-layout">
          <div className="skeleton id-skeleton-img" />
          <div className="id-skeleton-body">
            {[80, 40, 60, 100, 70].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 18, width: `${w}%`, borderRadius: 6, marginBottom: 12 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !item) return (
    <div className="lp-page">
      <Navbar />
      <div className="id-error-state">
        <AlertTriangle size={48} />
        <h3>{error || 'Item not found'}</h3>
        <Link to="/browse-listings" className="lp-btn lp-btn-primary">Back to Browse</Link>
      </div>
    </div>
  );

  const img = item.imageUrl || item.images?.[0];

  return (
    <div className="lp-page">
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
      <ContactSellerModal
        show={showContactModal}
        onClose={() => setShowContactModal(false)}
        item={item}
        onSuccess={msg => showToast(msg)}
        onError={msg => showToast(msg, 'error')}
      />

      <div className="id-container">

        {/* ── Back link ── */}
        <button className="id-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="id-layout">

          {/* ── Image panel ── */}
          <div className="id-img-panel">
            {img ? (
              <img src={img} alt={item.name} className="id-img" />
            ) : (
              <div className="id-img-placeholder">
                <Package size={64} />
              </div>
            )}
            {isSold && <div className="id-sold-overlay">Sold</div>}
            {item.stockQuantity < 5 && item.stockQuantity > 0 && !isSold && (
              <div className="id-low-stock">Only {item.stockQuantity} left</div>
            )}
          </div>

          {/* ── Detail panel ── */}
          <div className="id-detail-panel">

            {/* Status badge */}
            <div className="id-status-row">
              <span className={`id-status-badge ${isSold ? 'sold' : 'available'}`}>
                {isSold ? '🔴 Sold' : '🟢 Available'}
              </span>
              <span className="id-category-badge">
                <Tag size={12} /> {item.category}
              </span>
            </div>

            <h1 className="id-title">{item.name}</h1>
            <div className="id-price">₹{item.price.toLocaleString('en-IN')}</div>

            {/* Seller row */}
            <div className="id-seller-row">
              <div className="id-seller-avatar">
                {item.vendorName?.[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <div className="id-seller-label">Seller</div>
                <div className="id-seller-name">{item.vendorName || 'Unknown'}</div>
              </div>
            </div>

            {/* Description */}
            <div className="id-desc-block">
              <h4 className="id-desc-label">Description</h4>
              <p className="id-desc">{item.description}</p>
            </div>

            {/* ── Buyer actions ── */}
            {!isOwner && (
              <div className="id-actions">
                {!isSold && (
                  <button className="lp-btn lp-btn-primary id-cta" onClick={() => setShowContactModal(true)}>
                    <Mail size={16} /> Contact Seller
                  </button>
                )}
                {isSold && (
                  <div className="id-sold-notice">
                    <AlertTriangle size={16} /> This item has been sold
                  </div>
                )}
                <WishlistButton
                  itemId={item._id}
                  isWishlisted={isWishlisted}
                  onToggle={handleWishlistToggle}
                  showLabel
                />
              </div>
            )}

            {/* ── Owner actions ── */}
            {isOwner && (
              <div className="id-owner-actions">
                <button
                  className="lp-btn lp-btn-ghost"
                  onClick={() => navigate(`/my-listings/edit/${item._id}`)}
                  disabled={actionLoading}
                >
                  <Pencil size={15} /> Edit
                </button>
                {!isSold && (
                  <button
                    className="lp-btn id-btn-sold"
                    onClick={handleMarkSold}
                    disabled={actionLoading}
                  >
                    <CheckCircle2 size={15} />
                    {actionLoading ? 'Updating…' : 'Mark Sold'}
                  </button>
                )}
                <button
                  className="lp-btn lp-btn-danger"
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
