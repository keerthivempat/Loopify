import React, { useState } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../utils/api';

const WishlistButton = ({
  itemId,
  isWishlisted: initialWishlisted = false,
  onToggle,
  size = 20,
  className = '',
  showLabel = false,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    try {
      if (isWishlisted) {
        await axios.delete(`${API_BASE}/wishlist/${itemId}`, { headers: getAuthHeaders() });
        setIsWishlisted(false);
        onToggle?.(itemId, false);
      } else {
        await axios.post(`${API_BASE}/wishlist/${itemId}`, {}, { headers: getAuthHeaders() });
        setIsWishlisted(true);
        onToggle?.(itemId, true);
      }
    } catch (error) {
      onToggle?.(itemId, isWishlisted, error.response?.data?.message || 'Wishlist update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-link p-0 text-decoration-none wishlist-btn ${className}`}
      onClick={handleClick}
      disabled={loading}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm text-danger" role="status" />
      ) : (
        <Heart
          size={size}
          fill={isWishlisted ? '#dc3545' : 'none'}
          color={isWishlisted ? '#dc3545' : 'currentColor'}
        />
      )}
      {showLabel && (
        <span className="ms-2">{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
      )}
    </button>
  );
};

export default WishlistButton;
