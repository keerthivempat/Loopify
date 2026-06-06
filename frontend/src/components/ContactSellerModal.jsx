import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders } from '../utils/api';

const ContactSellerModal = ({ show, onClose, item, onSuccess, onError }) => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setForm({
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
        email: user.email || '',
        message: '',
      });
    } catch {
      setForm({ name: '', email: '', message: '' });
    }
  }, [show]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(
        `${API_BASE}/inquiries`,
        { itemId: item._id, ...form },
        { headers: getAuthHeaders() }
      );
      onSuccess?.('Inquiry sent successfully!');
      onClose();
    } catch (error) {
      onError?.(error.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header">
              <h5 className="modal-title">Contact Seller</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Send a message to <strong>{item.vendorName}</strong> about &ldquo;{item.name}&rdquo;
                </p>
                <div className="mb-3">
                  <label htmlFor="inquiryName" className="form-label">Name</label>
                  <input
                    id="inquiryName"
                    name="name"
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="inquiryEmail" className="form-label">Email</label>
                  <input
                    id="inquiryEmail"
                    name="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="inquiryMessage" className="form-label">Message</label>
                  <textarea
                    id="inquiryMessage"
                    name="message"
                    className="form-control"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Hi, I'm interested in this item..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    'Send Inquiry'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactSellerModal;
