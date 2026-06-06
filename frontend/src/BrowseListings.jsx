import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import Navbar from './Navbar';
import ListingCard from './components/ListingCard';
import Toast from './components/Toast';
import { CATEGORIES } from './constants/categories';
import { debounce } from './utils/debounce';
import { API_BASE, getAuthHeaders } from './utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SearchItems.css';

const BrowseListings = () => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API_BASE}/wishlist`, { headers: getAuthHeaders() });
      setWishlistedIds(new Set(response.data.map((w) => w._id)));
    } catch {
      setWishlistedIds(new Set());
    }
  };

  const fetchItems = async (search, categories) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categories.length) params.append('categories', categories.join(','));

      const response = await axios.get(
        `${API_BASE}/items?${params.toString()}`,
        { headers: getAuthHeaders() }
      );

      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce((search, categories) => {
    fetchItems(search, categories);
  }, 500), []);

  useEffect(() => {
    fetchWishlist();
    debouncedSearch(searchTerm, selectedCategories);
    return () => debouncedSearch.cancel();
  }, [searchTerm, selectedCategories, debouncedSearch, location.key]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleWishlistToggle = (itemId, isWishlisted, errorMsg) => {
    if (errorMsg) {
      showToast(errorMsg, 'error');
      return;
    }
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (isWishlisted) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
    showToast(isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <div className="browse-page">
      <Navbar />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="container mt-4 pb-5">
        <div className="browse-header mb-4">
          <h2 className="browse-title">Browse Listings</h2>
          <p className="text-muted mb-0">Discover quality second-hand items from verified sellers</p>
        </div>

        <div className="row">
          <div className="col-md-3">
            <div className="category-sidebar card border-0 shadow-sm p-3">
              <h5 className="category-title">Categories</h5>
              {CATEGORIES.map((category) => (
                <div key={category} className="form-check category-item">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  <label className="form-check-label" htmlFor={category}>
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-9">
            <div className="position-relative mb-4">
              <Search
                className="position-absolute text-muted"
                size={18}
                style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-control search-bar ps-5"
                placeholder="Search listings by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="row">
              {isLoading ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading listings...</p>
                </div>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <ListingCard
                    key={item._id}
                    item={item}
                    showSeller
                    showWishlistHeart
                    isWishlisted={wishlistedIds.has(item._id)}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">No listings found. Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseListings;
