import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Toast from './components/Toast';
import 'bootstrap/dist/css/bootstrap.min.css';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const MyCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [placing,   setPlacing]   = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [toast,     setToast]     = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');

  const showToast = (message, type = 'success') =>
    setToast({ show: true, message, type });

  useEffect(() => { fetchCartItems(); }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/auth'); return; }

      const response = await axios.get(`${API}/cart`, { headers: authHeader() });
      const filteredItems = response.data.cart?.items.filter(
        item => item.itemId.sellerId !== currentUserId
      ) || [];

      setCartItems(filteredItems);
      calculateTotal(filteredItems);
      setLoading(false);
    } catch {
      setError('Error fetching cart items');
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.itemId.price * item.quantity, 0);
    setTotalCost(total);
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`${API}/cart/remove/${itemId}`, { headers: authHeader() });
      const updated = cartItems.filter(item => item.itemId._id !== itemId);
      setCartItems(updated);
      calculateTotal(updated);
      showToast('Item removed from cart.');
    } catch {
      showToast('Error removing item from cart', 'error');
    }
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    try {
      setPlacing(true);
      const response = await axios.post(
        `${API}/orders/place`,
        { items: cartItems },
        { headers: authHeader() }
      );

      if (response.data.orders?.length > 0) {
        // Cart is cleared server-side; sync local state
        setCartItems([]);
        setTotalCost(0);
        showToast(`🎉 ${response.data.orders.length} order(s) placed! Check your OTP in Orders.`);
        // Navigate after short delay so toast is visible
        setTimeout(() => navigate('/orders-history'), 1800);
      } else {
        showToast('No valid orders could be created.', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error placing order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className="container mt-5 d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, show: false }))} />

      <div className="container mt-5 pb-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow-lg border-0 rounded-3">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="mb-0 py-2">
                  <i className="bi bi-cart3 me-2" />
                  My Cart
                </h2>
                <span className="badge bg-white text-primary rounded-pill">
                  {cartItems.length} items
                </span>
              </div>

              <div className="card-body p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-cart-x display-1 text-muted mb-4" />
                    <h3 className="text-muted">Your cart is empty</h3>
                    <button className="btn btn-primary mt-3" onClick={() => navigate('/browse-listings')}>
                      Browse Listings
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="list-group mb-4">
                      {cartItems.map((item, index) => (
                        <div
                          key={item.itemId._id}
                          className="list-group-item border-0 shadow-sm mb-3"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <h4 className="text-primary mb-3">{item.itemId.name}</h4>
                              <div className="row g-3">
                                <div className="col-6 col-md-4">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-tag-fill text-muted me-2" />
                                    <span>₹{item.itemId.price}</span>
                                  </div>
                                </div>
                                <div className="col-6 col-md-4">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-boxes text-muted me-2" />
                                    <span>Qty: {item.quantity}</span>
                                  </div>
                                </div>
                                <div className="col-12 col-md-4">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-currency-rupee text-muted me-2" />
                                    <span>₹{item.itemId.price * item.quantity}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4 mt-3 mt-md-0 text-md-end">
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => removeFromCart(item.itemId._id)}
                              >
                                <i className="bi bi-trash-fill me-2" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <h4 className="mb-0">Total Cost</h4>
                          <h3 className="mb-0 text-primary">₹{totalCost}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="text-end">
                      <button
                        id="place-order-btn"
                        className="btn btn-primary btn-lg"
                        onClick={placeOrder}
                        disabled={cartItems.length === 0 || placing}
                      >
                        {placing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Placing…
                          </>
                        ) : (
                          <>
                            <i className="bi bi-bag-check-fill me-2" />
                            Place Order
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCart;