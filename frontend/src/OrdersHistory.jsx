import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Toast from './components/Toast';
import SellerAcceptModal from './components/SellerAcceptModal';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import {
  MessageSquare, CheckCircle, XCircle,
  User, FileText, Mail, Calendar, Phone, Clock,
} from 'lucide-react';
import 'react-tabs/style/react-tabs.css';
import './OrdersHistory.css';

const API = 'http://localhost:5000/api';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Status meta map (inquiries only) ───────────────────────────
const INQ_STATUS = {
  pending:  { label: '🟡 Pending',  cls: 'status-pending'  },
  accepted: { label: '🟢 Accepted', cls: 'status-accepted' },
  rejected: { label: '🔴 Rejected', cls: 'status-rejected' },
};

const StatusBadge = ({ status }) => {
  const meta = INQ_STATUS[status] || INQ_STATUS.pending;
  return <span className={`oh-status-badge ${meta.cls}`}>{meta.label}</span>;
};

// ─── Buyer Inquiry Card ──────────────────────────────────────────
const BuyerInquiryCard = ({ inq }) => (
  <div className="oh-card buyer-inquiry-card">
    <div className="oh-card-header buyer-inq-header">
      <MessageSquare size={18} />
      <h5 className="oh-card-title">{inq.itemId?.name || 'Item Unavailable'}</h5>
      <StatusBadge status={inq.status} map={INQ_STATUS} />
    </div>
    <div className="oh-card-body">
      <div className="oh-detail"><User size={15} /><span><b>Seller:</b> {inq.sellerId?.firstName} {inq.sellerId?.lastName}</span></div>
      <div className="oh-detail message-row"><FileText size={15} /><span><b>Your Message:</b> {inq.inquiryMessage}</span></div>
      <div className="oh-detail"><Calendar size={15} /><span><b>Date:</b> {fmtDate(inq.createdAt)}</span></div>

      {inq.status === 'accepted' && (
        <div className="oh-seller-reply">
          {inq.sellerReply && (
            <div className="oh-reply-msg">
              <MessageSquare size={14} />
              <span><b>Seller Reply:</b> {inq.sellerReply}</span>
            </div>
          )}
          {inq.sellerPhone && (
            <div className="oh-reply-phone">
              <Phone size={14} />
              <span><b>Contact:</b> {inq.sellerPhone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

// ─── Seller Inquiry Card ─────────────────────────────────────────
const SellerInquiryCard = ({ inq, onAccept, onReject, actionLoading }) => {
  const isPending = inq.status === 'pending';
  return (
    <div className="oh-card inquiry-card">
      <div className="oh-card-header inquiry-header">
        <MessageSquare size={18} />
        <h5 className="oh-card-title">{inq.itemId?.name || 'Item Unavailable'}</h5>
        <StatusBadge status={inq.status} map={INQ_STATUS} />
      </div>
      <div className="oh-card-body">
        <div className="oh-detail"><User size={15} /><span><b>Buyer:</b> {inq.buyerName}</span></div>
        <div className="oh-detail"><Mail size={15} /><span><b>Email:</b> {inq.buyerEmail}</span></div>
        <div className="oh-detail message-row"><FileText size={15} /><span><b>Message:</b> {inq.inquiryMessage}</span></div>
        <div className="oh-detail"><Calendar size={15} /><span><b>Date:</b> {fmtDate(inq.createdAt)}</span></div>
        {inq.status === 'accepted' && inq.sellerPhone && (
          <div className="oh-detail"><Phone size={15} /><span><b>Your Contact:</b> {inq.sellerPhone}</span></div>
        )}
      </div>
      {isPending && (
        <div className="oh-card-actions">
          <button id={`accept-inq-${inq._id}`} className="oh-btn-accept"
            onClick={() => onAccept(inq._id)} disabled={actionLoading === inq._id}>
            {actionLoading === inq._id ? <span className="spinner-border spinner-border-sm" /> : <CheckCircle size={14} />}
            Accept
          </button>
          <button id={`reject-inq-${inq._id}`} className="oh-btn-reject"
            onClick={() => onReject(inq._id)} disabled={actionLoading === inq._id}>
            {actionLoading === inq._id ? <span className="spinner-border spinner-border-sm" /> : <XCircle size={14} />}
            Reject
          </button>
        </div>
      )}
    </div>
  );
};



const OrdersHistory = () => {
  const [buyerInquiries,  setBuyerInquiries]  = useState([]);
  const [sellerInquiries, setSellerInquiries] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [toast,           setToast]           = useState({ show: false, message: '', type: 'success' });
  const [actionLoading,   setActionLoading]   = useState(null);
  const [acceptModal,     setAcceptModal]     = useState({ show: false, inquiryId: null });

  const navigate = useNavigate();
  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });
  const hideToast = () => setToast(t => ({ ...t, show: false }));

  const fetchAll = useCallback(async () => {
    if (!localStorage.getItem('token')) { navigate('/auth'); return; }
    try {
      const [buyerInqRes, sellerInqRes] = await Promise.all([
        axios.get(`${API}/inquiries/buyer`,  { headers: authHeader() }),
        axios.get(`${API}/inquiries/seller`, { headers: authHeader() }),
      ]);
      setBuyerInquiries(buyerInqRes.data);
      setSellerInquiries(sellerInqRes.data);
    } catch {
      showToast('Failed to load inquiries. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAcceptModal = (inquiryId) => setAcceptModal({ show: true, inquiryId });

  const handleAcceptInquirySuccess = (updatedInquiry) => {
    setSellerInquiries(prev => prev.map(i => i._id === updatedInquiry._id ? updatedInquiry : i));
    showToast('Inquiry accepted! Buyer can now see your contact details.');
  };

  const handleRejectInquiry = async (id) => {
    try {
      setActionLoading(id);
      await axios.patch(`${API}/inquiries/${id}/reject`, {}, { headers: authHeader() });
      setSellerInquiries(prev => prev.map(i => i._id === id ? { ...i, status: 'rejected' } : i));
      showToast('Inquiry rejected.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject inquiry', 'error');
    } finally { setActionLoading(null); }
  };

  const sortByStatus = (arr) =>
    [...arr].sort((a, b) => {
      const rank = { pending: 0, accepted: 1, rejected: 2 };
      return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
    });

  const pendingCount = [
    ...buyerInquiries,
    ...sellerInquiries,
  ].filter(i => i.status === 'pending').length;

  if (loading) return (
    <div>
      <Navbar />
      <div className="loading-container">
        <div className="oh-spinner-wrap">
          <MessageSquare className="loading-icon" size={40} />
        </div>
        <p className="loading-text">Loading your inquiries…</p>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
      <SellerAcceptModal
        show={acceptModal.show}
        inquiryId={acceptModal.inquiryId}
        onClose={() => setAcceptModal({ show: false, inquiryId: null })}
        onSuccess={handleAcceptInquirySuccess}
        onError={(msg) => showToast(msg, 'error')}
      />

      <div className="orders-container">
        <div className="orders-header">
          <MessageSquare className="header-icon" />
          <h2>Inquiries</h2>
        </div>

        <Tabs className="custom-tabs">
          <TabList>
            <Tab id="tab-pending-orders">
              <Clock size={17} />
              <span>Pending Orders</span>
              {pendingCount > 0 && <span className="badge badge-alert">{pendingCount}</span>}
            </Tab>
          </TabList>

          {/* ══ Pending Orders: buyer sent + seller received ══ */}
          <TabPanel>
            <div className="pending-orders-panel">

              {/* My Sent Inquiries (buyer view) */}
              <div className="oh-section-heading">
                <MessageSquare size={16} /> My Sent Inquiries
                <span className="oh-section-count">{buyerInquiries.length}</span>
              </div>
              {buyerInquiries.length === 0 ? (
                <div className="no-orders small-empty">
                  <MessageSquare size={30} />
                  <p>You haven't sent any inquiries yet</p>
                </div>
              ) : (
                <div className="inquiries-grid">
                  {sortByStatus(buyerInquiries).map(inq => (
                    <BuyerInquiryCard key={inq._id} inq={inq} />
                  ))}
                </div>
              )}

              {/* Received Inquiries (seller view) */}
              <div className="oh-section-heading" style={{ marginTop: '2rem' }}>
                <Mail size={16} /> Received Inquiries
                <span className="oh-section-count">{sellerInquiries.length}</span>
              </div>
              {sellerInquiries.length === 0 ? (
                <div className="no-orders small-empty">
                  <Mail size={30} />
                  <p>No inquiries received yet</p>
                </div>
              ) : (
                <div className="inquiries-grid">
                  {sortByStatus(sellerInquiries).map(inq => (
                    <SellerInquiryCard
                      key={inq._id}
                      inq={inq}
                      onAccept={openAcceptModal}
                      onReject={handleRejectInquiry}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default OrdersHistory;