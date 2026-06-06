import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import Navbar from './Navbar';
import ListingCard from './components/ListingCard';
import Toast from './components/Toast';
import { API_BASE, getAuthHeaders } from './utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SearchItems.css';

const MyListings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatedMessage, setShowCreatedMessage] = useState(
    location.state?.listingCreated === true
  );
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  const fetchMyListings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE}/my-listings`, {
        headers: getAuthHeaders(),
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching my listings:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [location.key]);

  const handleEdit = (item) => {
    navigate(`/my-listings/edit/${item._id}`);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

    try {
      await axios.delete(`${API_BASE}/items/${item._id}`, {
        headers: getAuthHeaders(),
      });
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      showToast('Listing deleted successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete listing', 'error');
    }
  };

  const handleMarkSold = async (item) => {
    if (!window.confirm(`Mark "${item.name}" as sold?`)) return;

    try {
      const response = await axios.patch(
        `${API_BASE}/items/${item._id}/mark-sold`,
        {},
        { headers: getAuthHeaders() }
      );
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? response.data : i))
      );
      showToast('Listing marked as sold');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to mark listing as sold', 'error');
    }
  };

  return (
    <div>
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
      <div className="container mt-4 pb-5">
        {showCreatedMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            Listing created successfully! It is now visible in Browse Listings and My Listings.
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowCreatedMessage(false)}
              aria-label="Close"
            />
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="browse-title mb-1">My Listings</h2>
            <p className="text-muted mb-0">Manage your active and sold listings</p>
          </div>
          <Link to="/create-listing" className="btn btn-primary d-flex align-items-center gap-2">
            <PlusCircle size={18} />
            Create Listing
          </Link>
        </div>

        <div className="row">
          {isLoading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <ListingCard
                key={item._id}
                item={item}
                showSeller={false}
                showStatusBadge
                showActions
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkSold={handleMarkSold}
              />
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <p className="text-muted mb-3">You haven't listed any items yet.</p>
              <Link to="/create-listing" className="btn btn-primary">
                Create Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyListings;
