import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { PlusCircle, Package, CheckCircle2 } from 'lucide-react';
import Navbar from './Navbar';
import ListingCard from './components/ListingCard';
import Toast from './components/Toast';
import { API_BASE, getAuthHeaders } from './utils/api';
import './SearchItems.css';
import './MyListings.css';

const MyListings = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [items,    setItems]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'sold'
  const [actionIds, setActionIds] = useState(new Set()); // items currently being actioned
  const [showCreatedMessage, setShowCreatedMessage] = useState(location.state?.listingCreated === true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  const fetchMyListings = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/my-listings`, { headers: getAuthHeaders() });
      setItems(res.data);
    } catch { setItems([]); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchMyListings(); }, [location.key]);

  const handleEdit   = (item) => navigate(`/my-listings/edit/${item._id}`);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setActionIds(prev => new Set(prev).add(item._id));
    try {
      await axios.delete(`${API_BASE}/items/${item._id}`, { headers: getAuthHeaders() });
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      showToast('Listing deleted');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setActionIds(prev => { const s = new Set(prev); s.delete(item._id); return s; });
    }
  };

  const handleMarkSold = async (item) => {
    if (!window.confirm(`Mark "${item.name}" as sold?`)) return;
    setActionIds(prev => new Set(prev).add(item._id));
    try {
      const res = await axios.patch(`${API_BASE}/items/${item._id}/mark-sold`, {}, { headers: getAuthHeaders() });
      setItems((prev) => prev.map((i) => (i._id === item._id ? res.data : i)));
      showToast('Listing marked as sold');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to mark sold', 'error');
    } finally {
      setActionIds(prev => { const s = new Set(prev); s.delete(item._id); return s; });
    }
  };

  const handleMarkAvailable = async (item) => {
    setActionIds(prev => new Set(prev).add(item._id));
    try {
      const res = await axios.patch(`${API_BASE}/items/${item._id}/mark-available`, {}, { headers: getAuthHeaders() });
      setItems((prev) => prev.map((i) => (i._id === item._id ? res.data : i)));
      showToast('Listing restored to available');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to restore listing', 'error');
    } finally {
      setActionIds(prev => { const s = new Set(prev); s.delete(item._id); return s; });
    }
  };

  const active = items.filter((i) => i.status !== 'sold');
  const sold   = items.filter((i) => i.status === 'sold');
  const displayed = activeTab === 'active' ? active : sold;

  return (
    <div className="lp-page">
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="ml-container">
        {/* ── Header ── */}
        <div className="ml-header">
          <div>
            <h1 className="ml-title">My Listings</h1>
            <p className="ml-sub">Manage your active and sold items</p>
          </div>
          <Link to="/create-listing" className="lp-btn lp-btn-primary">
            <PlusCircle size={17} /> New Listing
          </Link>
        </div>

        {showCreatedMessage && (
          <div className="ml-success-banner">
            ✅ Listing created successfully! It's now visible in Browse Listings.
            <button onClick={() => setShowCreatedMessage(false)}>✕</button>
          </div>
        )}

        {/* ── Stats + Tab switcher ── */}
        <div className="ml-tabs-bar">
          <button
            className={`ml-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <Package size={16} />
            Active
            <span className="ml-tab-count">{active.length}</span>
          </button>
          <button
            className={`ml-tab ${activeTab === 'sold' ? 'active' : ''}`}
            onClick={() => setActiveTab('sold')}
          >
            <CheckCircle2 size={16} />
            Sold
            <span className="ml-tab-count">{sold.length}</span>
          </button>
        </div>

        {/* ── Grid ── */}
        {isLoading ? (
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
        ) : displayed.length > 0 ? (
          <div className="lp-listings-grid">
            {displayed.map((item) => (
              <ListingCard
                key={item._id}
                item={item}
                showSeller={false}
                showStatusBadge
                showActions
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkSold={handleMarkSold}
                onMarkAvailable={handleMarkAvailable}
                actionLoading={actionIds.has(item._id)}
              />
            ))}
          </div>
        ) : (
          <div className="lp-empty">
            {activeTab === 'active'
              ? <><Package size={56} /><h3>No active listings</h3><p>Create your first listing to start selling</p><Link to="/create-listing" className="lp-btn lp-btn-primary" style={{ marginTop: '0.75rem' }}>Create Listing</Link></>
              : <><CheckCircle2 size={56} /><h3>No sold items yet</h3><p>Items you mark as sold will appear here</p></>
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
