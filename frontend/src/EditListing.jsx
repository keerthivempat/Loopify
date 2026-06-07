import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import ListingForm from './components/ListingForm';
import Toast from './components/Toast';
import { API_BASE, getAuthHeaders } from './utils/api';
import './CreateListing.css';

const EditListing = () => {
  const { id } = useParams();
  const [item,        setItem]        = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSubmitting,setIsSubmitting]= useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });
  const hideToast = () => setToast(t => ({ ...t, show: false }));

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`${API_BASE}/items/${id}`);
        setItem(res.data);
      } catch {
        showToast('Listing not found', 'error');
        setTimeout(() => navigate('/my-listings'), 1500);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await axios.put(`${API_BASE}/items/${id}`, formData, { headers: getAuthHeaders() });
      navigate('/my-listings');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update listing', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lp-page">
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="cl-container">
        <Link to="/my-listings" className="cl-back">
          <ArrowLeft size={16} /> My Listings
        </Link>

        <div className="cl-card lp-card">
          <div className="cl-card-header">
            <h2 className="cl-title">Edit Listing</h2>
            <p className="cl-sub">Update your listing details</p>
          </div>
          <div className="cl-card-body">
            {isLoading ? (
              <div className="cl-skeleton">
                {[100, 80, 60, 100, 50].map((w, i) => (
                  <div key={i} className="skeleton cl-skeleton-line" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : item ? (
              <ListingForm
                initialData={item}
                onSubmit={handleSubmit}
                submitLabel="Save Changes"
                isSubmitting={isSubmitting}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListing;
