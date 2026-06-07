import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Toast from './components/Toast';

const API = 'https://loopify-pl69.onrender.com/api';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const DeliverItems = () => {
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [otpInputs,  setOtpInputs]  = useState({});
  const [completing, setCompleting] = useState(null); // orderId being completed
  const [toast,      setToast]      = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const showToast = (message, type = 'success') =>
    setToast({ show: true, message, type });

  useEffect(() => { fetchPendingDeliveries(); }, []);

  const fetchPendingDeliveries = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/auth'); return; }

      const response = await axios.get(`${API}/orders/seller`, { headers: authHeader() });

      // Show both 'pending' (awaiting seller accept) and 'handover_pending' (OTP stage)
      const active = response.data.filter(o =>
        ['pending', 'handover_pending'].includes(o.status)
      );
      setPendingDeliveries(active);

      const inputs = {};
      active.forEach(o => { inputs[o._id] = ''; });
      setOtpInputs(inputs);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      showToast('Failed to load deliveries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (orderId, value) =>
    setOtpInputs(prev => ({ ...prev, [orderId]: value.replace(/\D/g, '') }));

  const completeDelivery = async (orderId) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length < 6) {
      showToast('Please enter the 6-digit OTP', 'error');
      return;
    }
    try {
      setCompleting(orderId);
      await axios.post(
        `${API}/orders/complete`,
        { orderId, otp },
        { headers: authHeader() }
      );
      // Remove from list optimistically
      setPendingDeliveries(prev => prev.filter(o => o._id !== orderId));
      showToast('✅ Delivery completed! Item marked as sold.');
    } catch (err) {
      if (err.response?.status === 400) {
        showToast('Invalid OTP. Please check and try again.', 'error');
      } else {
        showToast('Error completing delivery. Please try again.', 'error');
      }
    } finally {
      setCompleting(null);
    }
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, show: false }))}
      />

      <div className="container mt-5 pb-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow-lg border-0 rounded-3">
              <div className="card-header bg-primary text-white">
                <h2 className="mb-0 py-2">Pending Deliveries</h2>
              </div>
              <div className="card-body p-4">
                {pendingDeliveries.length === 0 ? (
                  <div className="alert alert-info">No pending deliveries</div>
                ) : (
                  <div className="delivery-list">
                    {pendingDeliveries.map((delivery, index) => {
                      const isHandover  = delivery.status === 'handover_pending';
                      const isCompleting = completing === delivery._id;

                      return (
                        <div
                          key={delivery._id}
                          className="card mb-4 border-0 shadow-sm"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-8">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                  <h4 className="text-primary mb-0">
                                    {delivery.itemId?.name || 'Product Unavailable'}
                                  </h4>
                                  {/* Status pill */}
                                  <span className={`badge ${isHandover ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                    {isHandover ? 'Handover Pending' : 'Pending'}
                                  </span>
                                </div>
                                <div className="row g-3">
                                  <div className="col-6">
                                    <p className="mb-1"><strong>Price:</strong> ₹{delivery.itemId?.price || 0}</p>
                                    <p className="mb-1"><strong>Quantity:</strong> {delivery.quantity}</p>
                                    <p className="mb-1"><strong>Total:</strong> ₹{(delivery.itemId?.price || 0) * delivery.quantity}</p>
                                  </div>
                                  <div className="col-6">
                                    <p className="mb-1"><strong>Buyer:</strong> {delivery.buyerId?.firstName} {delivery.buyerId?.lastName}</p>
                                    <p className="mb-1"><strong>Email:</strong> {delivery.buyerId?.email}</p>
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.78rem' }}>
                                      <strong>Order ID:</strong> {delivery._id}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* OTP input — only for handover_pending */}
                              <div className="col-md-4 mt-3 mt-md-0">
                                {isHandover ? (
                                  <div>
                                    <div className="form-floating mb-3">
                                      <input
                                        type="text"
                                        className="form-control"
                                        id={`otp-${delivery._id}`}
                                        placeholder="Enter OTP"
                                        maxLength={6}
                                        value={otpInputs[delivery._id] || ''}
                                        onChange={e => handleOtpChange(delivery._id, e.target.value)}
                                      />
                                      <label htmlFor={`otp-${delivery._id}`}>Enter 6-digit OTP</label>
                                    </div>
                                    <button
                                      id={`complete-btn-${delivery._id}`}
                                      className="btn btn-success w-100"
                                      onClick={() => completeDelivery(delivery._id)}
                                      disabled={!otpInputs[delivery._id] || otpInputs[delivery._id].length < 6 || isCompleting}
                                    >
                                      {isCompleting ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                          Verifying…
                                        </>
                                      ) : (
                                        <>
                                          <i className="bi bi-check2-circle me-2" />
                                          Complete Delivery
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center text-muted mt-3">
                                    <i className="bi bi-hourglass-split me-1" />
                                    <small>Accept order in Sales History to begin handover</small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverItems;