import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Navbar from './Navbar';
import ListingCard from './components/ListingCard';
import Toast from './components/Toast';
import { CATEGORIES } from './constants/categories';
import { debounce } from './utils/debounce';
import { API_BASE, getAuthHeaders } from './utils/api';
import './SearchItems.css';

/* ── Skeleton card ─────────────────────────────────── */
const SkeletonCard = () => (
  <div className="lp-skeleton-card">
    <div className="skeleton lp-skeleton-img" />
    <div className="lp-skeleton-body">
      <div className="skeleton lp-skeleton-line w-full" />
      <div className="skeleton lp-skeleton-line w-60" />
      <div className="skeleton lp-skeleton-line w-40" />
    </div>
  </div>
);

const CATEGORY_ICONS = {
  Electronics:   '📱',
  Books:         '📚',
  Clothing:      '👕',
  Furniture:     '🛋️',
  Stationery:    '✏️',
  Sports:        '⚽',
  Miscellaneous: '📦',
};

/* Quick-select price presets */
const PRICE_PRESETS = [
  { label: 'Under ₹500',    min: '',    max: '500'  },
  { label: '₹500 – ₹2K',   min: '500', max: '2000' },
  { label: '₹2K – ₹5K',    min: '2000',max: '5000' },
  { label: '₹5K – ₹10K',   min: '5000',max: '10000'},
  { label: 'Above ₹10K',   min: '10000',max: ''    },
];

const BrowseListings = () => {
  const location = useLocation();
  const panelRef = useRef(null);

  const [items,              setItems]              = useState([]);
  const [searchTerm,         setSearchTerm]         = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading,          setIsLoading]          = useState(true);
  const [wishlistedIds,      setWishlistedIds]      = useState(new Set());
  const [showFilters,        setShowFilters]        = useState(false);
  const [priceRange,         setPriceRange]         = useState({ min: '', max: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  /* Close filter panel on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (showFilters && panelRef.current && !panelRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilters]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_BASE}/wishlist`, { headers: getAuthHeaders() });
      setWishlistedIds(new Set(res.data.map((w) => w._id)));
    } catch { setWishlistedIds(new Set()); }
  };

  const fetchItems = async (search, categories) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categories.length) params.append('categories', categories.join(','));
      const res = await axios.get(`${API_BASE}/items?${params.toString()}`, { headers: getAuthHeaders() });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch { setItems([]); } finally { setIsLoading(false); }
  };

  const debouncedSearch = useCallback(debounce((s, c) => fetchItems(s, c), 500), []);

  useEffect(() => {
    fetchWishlist();
    debouncedSearch(searchTerm, selectedCategories);
    return () => debouncedSearch.cancel();
  }, [searchTerm, selectedCategories, debouncedSearch, location.key]);

  const handleCategoryToggle = (cat) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleWishlistToggle = (itemId, isWishlisted, errorMsg) => {
    if (errorMsg) { showToast(errorMsg, 'error'); return; }
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      isWishlisted ? next.add(itemId) : next.delete(itemId);
      return next;
    });
    showToast(isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const applyPreset = (preset) => {
    setPriceRange({ min: preset.min, max: preset.max });
  };

  const isPresetActive = (preset) =>
    priceRange.min === preset.min && priceRange.max === preset.max;

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
    setShowFilters(false);
  };

  const hasPriceFilter = priceRange.min !== '' || priceRange.max !== '';
  const hasAnyFilter   = selectedCategories.length > 0 || hasPriceFilter;
  const filterCount    = selectedCategories.length + (hasPriceFilter ? 1 : 0);

  const filteredItems = items.filter((item) => {
    const price = item.price ?? 0;
    const aboveMin = priceRange.min === '' || price >= Number(priceRange.min);
    const belowMax = priceRange.max === '' || price <= Number(priceRange.max);
    return aboveMin && belowMax;
  });

  const priceLabel = hasPriceFilter
    ? `₹${priceRange.min || '0'} – ${priceRange.max ? `₹${priceRange.max}` : 'Any'}`
    : null;

  return (
    <div className="lp-page">
      <Navbar onSearch={setSearchTerm} />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />

      {/* ── Hero search bar ── */}
      <div className="browse-hero">
        <div className="browse-hero-inner">
          <h1 className="browse-hero-title">Find something you'll love</h1>
          <p className="browse-hero-sub">Quality second-hand items from verified sellers near you</p>
          <div className="browse-search-bar">
            <Search size={20} className="browse-search-icon" />
            <input
              id="browse-search"
              type="text"
              className="browse-search-input"
              placeholder="Search listings — electronics, books, furniture…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="browse-search-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="browse-container">

        {/* ── Toolbar: category chips + filter button ── */}
        <div className="browse-toolbar">
          {/* Scrollable category strip */}
          <div className="browse-cats">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`browse-cat-chip ${selectedCategories.includes(cat) ? 'active' : ''}`}
                onClick={() => handleCategoryToggle(cat)}
              >
                <span>{CATEGORY_ICONS[cat] || '🏷️'}</span>
                {cat}
              </button>
            ))}
          </div>

          {/* Filters toggle button */}
          <div className="browse-filter-btn-wrap" ref={panelRef}>
            <button
              id="filters-toggle"
              className={`browse-filter-btn${showFilters ? ' active' : ''}`}
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={16} />
              Filters
              {filterCount > 0 && <span className="browse-filter-badge">{filterCount}</span>}
              <ChevronDown size={14} className={`browse-filter-chevron${showFilters ? ' open' : ''}`} />
            </button>

            {/* ── Dropdown filter panel ── */}
            {showFilters && (
              <div className="browse-filter-panel" role="dialog" aria-label="Filter options">

                {/* Price Range section */}
                <div className="bfp-section">
                  <p className="bfp-section-title">💰 Price Range</p>

                  {/* Quick presets */}
                  <div className="bfp-presets">
                    {PRICE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        className={`bfp-preset${isPresetActive(preset) ? ' active' : ''}`}
                        onClick={() => isPresetActive(preset)
                          ? setPriceRange({ min: '', max: '' })
                          : applyPreset(preset)
                        }
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Manual min / max inputs */}
                  <p className="bfp-or">or enter a custom range</p>
                  <div className="bfp-inputs">
                    <div className="bfp-input-wrap">
                      <span className="bfp-currency">₹</span>
                      <input
                        id="price-min"
                        type="number"
                        className="bfp-input"
                        placeholder="Min"
                        min="0"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                      />
                    </div>
                    <span className="bfp-sep">to</span>
                    <div className="bfp-input-wrap">
                      <span className="bfp-currency">₹</span>
                      <input
                        id="price-max"
                        type="number"
                        className="bfp-input"
                        placeholder="Max"
                        min="0"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Panel footer */}
                <div className="bfp-footer">
                  <button className="bfp-reset" onClick={clearFilters}>Reset all</button>
                  <button className="bfp-apply" onClick={() => setShowFilters(false)}>
                    Show {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {hasAnyFilter && (
          <div className="browse-active-bar">
            <span className="browse-active-label">Active filters:</span>
            <div className="browse-active-filters">
              {selectedCategories.map((cat) => (
                <span key={cat} className="browse-active-chip">
                  {CATEGORY_ICONS[cat]} {cat}
                  <button onClick={() => handleCategoryToggle(cat)} title={`Remove ${cat}`}><X size={11} /></button>
                </span>
              ))}
              {hasPriceFilter && (
                <span className="browse-active-chip">
                  💰 {priceLabel}
                  <button onClick={() => setPriceRange({ min: '', max: '' })} title="Remove price filter"><X size={11} /></button>
                </span>
              )}
            </div>
            <button className="browse-clear-filters" onClick={clearFilters}>
              <X size={13} /> Clear all
            </button>
          </div>
        )}

        {/* ── Results count ── */}
        <div className="browse-results-header">
          <span className="browse-results-count">
            {isLoading ? 'Loading…' : `${filteredItems.length} listing${filteredItems.length !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="lp-listings-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="lp-listings-grid">
            {filteredItems.map((item) => (
              <ListingCard
                key={item._id}
                item={item}
                showSeller
                showWishlistHeart
                isWishlisted={wishlistedIds.has(item._id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        ) : (
          <div className="lp-empty">
            <Search size={56} />
            <h3>No listings found</h3>
            <p>Try different keywords or remove some filters</p>
            {(searchTerm || hasAnyFilter) && (
              <button className="lp-btn lp-btn-outline" style={{ marginTop: '0.5rem' }} onClick={clearFilters}>
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseListings;
