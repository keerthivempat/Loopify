import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import ListingForm from './components/ListingForm';
import Toast from './components/Toast';
import { API_BASE, getAuthHeaders } from './utils/api';
import './CreateListing.css';

const CreateListing = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });
  const hideToast = () => setToast(t => ({ ...t, show: false }));

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE}/items`, formData, { headers: getAuthHeaders() });
      navigate('/my-listings', { state: { listingCreated: true } });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create listing', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lp-page">
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="cl-container">
        {/* ── Back link ── */}
        <Link to="/my-listings" className="cl-back">
          <ArrowLeft size={16} /> My Listings
        </Link>

        <div className="cl-card lp-card">
          <div className="cl-card-header">
            <h2 className="cl-title">Create Listing</h2>
            <p className="cl-sub">List an item for sale on Loopify</p>
          </div>
          <div className="cl-card-body">
            <ListingForm
              onSubmit={handleSubmit}
              submitLabel="Create Listing"
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
