import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders } from '../utils/api';

// Modal for seller to enter phone + reply when accepting
const SellerAcceptModal = ({ show, inquiryId, onClose, onSuccess, onError }) => {
  const [form, setForm] = useState({ sellerPhone: '', sellerReply: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (show) setForm({ sellerPhone: '', sellerReply: '' }); }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sellerPhone.trim()) { onError?.('Phone number is required'); return; }
    setSubmitting(true);
    try {
      const res = await axios.patch(
        `${API_BASE}/inquiries/${inquiryId}/accept`,
        { sellerPhone: form.sellerPhone, sellerReply: form.sellerReply },
        { headers: getAuthHeaders() }
      );
      onSuccess?.(res.data.inquiry);
      onClose();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to accept inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">✅ Accept Inquiry</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close" />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p className="text-muted small mb-3">Provide your contact details for the buyer.</p>
              <div className="mb-3">
                <label htmlFor="sellerPhone" className="form-label fw-semibold">
                  📞 Contact Number <span className="text-danger">*</span>
                </label>
                <input
                  id="sellerPhone"
                  type="tel"
                  className="form-control"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.sellerPhone}
                  onChange={e => setForm(f => ({ ...f, sellerPhone: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="sellerReply" className="form-label fw-semibold">
                  💬 Reply Message <span className="text-muted fw-normal">(optional)</span>
                </label>
                <textarea
                  id="sellerReply"
                  className="form-control"
                  rows={3}
                  placeholder="Hi, the item is still available. Please contact me."
                  value={form.sellerReply}
                  onChange={e => setForm(f => ({ ...f, sellerReply: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                ) : 'Confirm & Accept'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerAcceptModal;
