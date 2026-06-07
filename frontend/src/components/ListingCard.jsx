import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Tag, Heart, RotateCcw } from 'lucide-react';
import WishlistButton from './WishlistButton';

const ListingCard = ({
  item,
  showSeller        = true,
  showStatusBadge   = false,
  showActions       = false,
  showWishlistHeart = false,
  isWishlisted      = false,
  actionLoading     = false,
  onEdit,
  onDelete,
  onMarkSold,
  onMarkAvailable,
  onWishlistToggle,
  onRemoveFromWishlist,
}) => {
  const isSold   = item.status === 'sold';
  const imageSrc = item.imageUrl || item.images?.[0] || 'https://placehold.co/400x300?text=No+Image';

  return (
    <div className="lp-listing-card fade-up">
      {/* Image */}
      <div className="lp-card-img-wrap">
        <Link to={`/items/${item._id}`} tabIndex={-1}>
          <img src={imageSrc} alt={item.name} className="lp-card-img" loading="lazy" />
        </Link>

        {/* Status badge */}
        {showStatusBadge && (
          <span className={`lp-card-status-badge ${isSold ? 'sold' : 'available'}`}>
            {isSold ? 'Sold' : 'Available'}
          </span>
        )}

        {/* Wishlist heart */}
        {showWishlistHeart && (
          <div className="lp-card-heart">
            <WishlistButton
              itemId={item._id}
              isWishlisted={isWishlisted}
              onToggle={onWishlistToggle}
              size={18}
            />
          </div>
        )}

        {/* Category chip */}
        <span className="lp-card-category">{item.category}</span>
      </div>

      {/* Body */}
      <div className="lp-card-body">
        <Link to={`/items/${item._id}`} className="lp-card-name">{item.name}</Link>

        <div className="lp-card-price">₹{item.price?.toLocaleString()}</div>

        {showSeller && (
          <div className="lp-card-seller">
            <div className="lp-card-seller-avatar">
              {(item.vendorName || 'S')[0].toUpperCase()}
            </div>
            <span>{item.vendorName}</span>
          </div>
        )}

        {/* Actions */}
        {showActions ? (
          <div className="lp-card-actions">
            <Link to={`/items/${item._id}`} className="lp-card-action-btn view">
              View
            </Link>
            <button className="lp-card-action-btn edit" onClick={() => onEdit?.(item)} title="Edit" disabled={actionLoading}>
              <Pencil size={14} />
            </button>
            {!isSold ? (
              <button className="lp-card-action-btn sold" onClick={() => onMarkSold?.(item)} title="Mark Sold" disabled={actionLoading}>
                {actionLoading ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : <Tag size={14} />}
              </button>
            ) : (
              <button className="lp-card-action-btn available" onClick={() => onMarkAvailable?.(item)} title="Mark Available" disabled={actionLoading}>
                {actionLoading ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : <RotateCcw size={14} />}
              </button>
            )}
            <button className="lp-card-action-btn del" onClick={() => onDelete?.(item)} title="Delete" disabled={actionLoading}>
              {actionLoading ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : <Trash2 size={14} />}
            </button>
          </div>
        ) : onRemoveFromWishlist ? (
          <div className="lp-card-actions">
            <Link to={`/items/${item._id}`} className="lp-card-action-btn view">View</Link>
            <button
              className="lp-card-action-btn del"
              onClick={() => onRemoveFromWishlist(item)}
              title="Remove from wishlist"
            >
              <Heart size={14} />
            </button>
          </div>
        ) : (
          <Link to={`/items/${item._id}`} className="lp-card-cta">
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
