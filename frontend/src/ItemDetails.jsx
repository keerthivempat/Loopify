import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Toast from './components/Toast';
import ContactSellerModal from './components/ContactSellerModal';
import WishlistButton from './components/WishlistButton';
import { API_BASE, getAuthHeaders, getCurrentUser } from './utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import { Star, Package, Award, AlertTriangle, Mail, Pencil, Trash2, Tag } from 'lucide-react';

const ItemDetails = () => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  const isOwner = item && currentUser && (
    item.sellerId?.toString() === currentUser.id?.toString() ||
    item.createdBy?.toString() === currentUser.id?.toString()
  );
  const isSold = item?.status === 'sold';

  useEffect(() => {
    fetchItemDetails();
    fetchWishlistStatus();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/items/${id}`);
      setItem(response.data);
      setError(null);
    } catch {
      setError('Error fetching item details');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/wishlist`, { headers: getAuthHeaders() });
      const ids = response.data.map((w) => w._id);
      setIsWishlisted(ids.includes(id));
    } catch {
      setIsWishlisted(false);
    }
  };



  const handleMarkSold = async () => {
    if (!window.confirm(`Mark "${item.name}" as sold?`)) return;
    setActionLoading(true);
    try {
      const response = await axios.patch(
        `${API_BASE}/items/${id}/mark-sold`,
        {},
        { headers: getAuthHeaders() }
      );
      setItem(response.data);
      showToast('Listing marked as sold');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to mark as sold', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/items/${id}`, { headers: getAuthHeaders() });
      showToast('Listing deleted successfully');
      setTimeout(() => navigate('/my-listings'), 1000);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete listing', 'error');
      setActionLoading(false);
    }
  };

  const handleWishlistToggle = (_itemId, _isWishlisted, errorMsg) => {
    if (errorMsg) {
      showToast(errorMsg, 'error');
      return;
    }
    setIsWishlisted(_isWishlisted);
    showToast(_isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center text-danger">
        <AlertTriangle className="me-2" />{error}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center text-warning">
        <AlertTriangle className="me-2" />Item not found
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />

      <ContactSellerModal
        show={showContactModal}
        onClose={() => setShowContactModal(false)}
        item={item}
        onSuccess={(msg) => showToast(msg)}
        onError={(msg) => showToast(msg, 'error')}
      />

      <div className="container py-5">
        <div className="card border-0 shadow-lg animate__animated animate__fadeIn">
          <div className="row g-0">
            <div className="col-md-6 p-4">
              <div className="position-relative">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/400'}
                  alt={item.name}
                  className={`img-fluid rounded-3 shadow ${imageLoaded ? 'animate__animated animate__fadeIn' : 'd-none'}`}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="placeholder-glow w-100 h-100">
                    <div className="placeholder w-100" style={{ height: '400px' }} />
                  </div>
                )}
                {item.stockQuantity < 5 && item.stockQuantity > 0 && !isSold && (
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className="badge bg-warning animate__animated animate__pulse animate__infinite">
                      Only {item.stockQuantity} left!
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6 p-4">
              <div className="h-100 d-flex flex-column">
                <div className="mb-4">
                  <h1 className="display-5 fw-bold mb-3 animate__animated animate__fadeInRight">
                    {item.name}
                  </h1>
                  <div className="d-flex align-items-center mb-3 animate__animated animate__fadeInRight animate__delay-1s">
                    <h3 className="text-primary mb-0">₹{item.price.toLocaleString()}</h3>
                    {isSold ? (
                      <span className="badge bg-danger ms-3">🔴 Sold</span>
                    ) : item.stockQuantity > 0 ? (
                      <span className="badge bg-success ms-3">Available</span>
                    ) : (
                      <span className="badge bg-danger ms-3">Out of Stock</span>
                    )}
                  </div>
                </div>

                <div className="mb-3 animate__animated animate__fadeInRight animate__delay-0.5s">
                  <div className="d-flex align-items-center mb-2">
                    <Award className="text-primary me-2" />
                    <span className="text-muted">Seller: {item.vendorName}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Package className="text-primary me-2" />
                    <span className="text-muted">Category: {item.category}</span>
                  </div>
                </div>

                {!isOwner && !isSold && (
                  <div className="mb-4">
                    <button
                      className="btn btn-outline-primary d-flex align-items-center gap-2"
                      onClick={() => setShowContactModal(true)}
                    >
                      <Mail size={18} />
                      Contact Seller
                    </button>
                  </div>
                )}

                <div className="mb-4 animate__animated animate__fadeInRight animate__delay-0.5s">
                  <h5 className="d-flex align-items-center">
                    <Star className="text-primary me-2" />
                    Description
                  </h5>
                  <p className="lead">{item.description}</p>
                </div>

                <div className="mt-auto animate__animated animate__fadeInUp animate__delay-0.5s">
                  {!isOwner && (
                    <>
                      {!isSold && (
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <div className="btn btn-outline-danger d-flex align-items-center gap-2">
                            <WishlistButton
                              itemId={item._id}
                              isWishlisted={isWishlisted}
                              onToggle={handleWishlistToggle}
                              showLabel
                            />
                          </div>
                        </div>
                      )}

                      {isSold && (
                        <>
                          <div className="alert alert-secondary d-flex align-items-center mb-3" role="alert">
                            <AlertTriangle className="me-2" />
                            This item has been sold
                          </div>
                          <div className="btn btn-outline-danger d-flex align-items-center gap-2 mb-3">
                            <WishlistButton
                              itemId={item._id}
                              isWishlisted={isWishlisted}
                              onToggle={handleWishlistToggle}
                              showLabel
                            />
                          </div>
                        </>
                      )}

                      {!isSold && item.stockQuantity < 1 && (
                        <div className="alert alert-danger d-flex align-items-center" role="alert">
                          <AlertTriangle className="me-2" />
                          This item is currently out of stock
                        </div>
                      )}
                    </>
                  )}

                  {isOwner && (
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={() => navigate(`/my-listings/edit/${item._id}`)}
                        disabled={actionLoading}
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger d-flex align-items-center gap-1"
                        onClick={handleDelete}
                        disabled={actionLoading}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                      {!isSold && (
                        <button
                          className="btn btn-outline-warning d-flex align-items-center gap-1"
                          onClick={handleMarkSold}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" />
                          ) : (
                            <>
                              <Tag size={16} />
                              Mark Sold
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
