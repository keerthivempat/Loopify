import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Tag } from 'lucide-react';
import WishlistButton from './WishlistButton';
import '../SearchItems.css';

const ListingCard = ({
  item,
  showSeller = true,
  showStatusBadge = false,
  showActions = false,
  showWishlistHeart = false,
  isWishlisted = false,
  onEdit,
  onDelete,
  onMarkSold,
  onWishlistToggle,
  onRemoveFromWishlist,
}) => {
  const isSold = item.status === 'sold';
  const imageSrc = item.imageUrl || item.images?.[0] || 'https://via.placeholder.com/150';

  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100 item-card fade-in">
        <div className="position-relative">
          <img
            src={imageSrc}
            className="card-img-top"
            alt={item.name}
            style={{ height: '200px', objectFit: 'cover' }}
          />
          {showWishlistHeart && (
            <div className="position-absolute top-0 start-0 m-2 wishlist-heart-overlay">
              <WishlistButton
                itemId={item._id}
                isWishlisted={isWishlisted}
                onToggle={onWishlistToggle}
                size={22}
                className="bg-white rounded-circle shadow-sm p-1"
              />
            </div>
          )}
          {showStatusBadge && (
            <span
              className={`badge position-absolute top-0 end-0 m-2 ${
                isSold ? 'bg-secondary' : 'bg-success'
              }`}
            >
              {isSold ? 'Sold' : 'Available'}
            </span>
          )}
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{item.name}</h5>
          <p className="card-text price">₹{item.price?.toLocaleString()}</p>
          <p className="card-text">
            <small className="text-muted">Category: {item.category}</small>
          </p>
          {showSeller && (
            <p className="card-text text-muted mb-3">
              Seller: {item.vendorName}
            </p>
          )}

          {showActions ? (
            <div className="mt-auto d-grid gap-2">
              <Link
                to={`/items/${item._id}`}
                className="btn btn-outline-primary btn-sm"
              >
                View Details
              </Link>
              <button
                className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-1"
                onClick={() => onEdit?.(item)}
              >
                <Pencil size={14} />
                Edit Listing
              </button>
              {!isSold && (
                <button
                  className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center gap-1"
                  onClick={() => onMarkSold?.(item)}
                >
                  <Tag size={14} />
                  Mark as Sold
                </button>
              )}
              <button
                className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-1"
                onClick={() => onDelete?.(item)}
              >
                <Trash2 size={14} />
                Delete Listing
              </button>
            </div>
          ) : onRemoveFromWishlist ? (
            <div className="mt-auto d-grid gap-2">
              <Link
                to={`/items/${item._id}`}
                className="btn btn-primary btn-sm"
              >
                View Details
              </Link>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => onRemoveFromWishlist(item)}
              >
                Remove from Wishlist
              </button>
            </div>
          ) : (
            <Link
              to={`/items/${item._id}`}
              className="btn btn-primary view-details-btn mt-auto"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
