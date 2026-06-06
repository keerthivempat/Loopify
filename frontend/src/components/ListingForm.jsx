import React, { useState } from 'react';
import { CATEGORIES } from '../constants/categories';

const ListingForm = ({ initialData = {}, onSubmit, submitLabel = 'Create Listing', isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price ?? '',
    category: initialData.category || CATEGORIES[0],
    stockQuantity: initialData.stockQuantity ?? 1,
    imageUrl: initialData.imageUrl || initialData.images?.[0] || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stockQuantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      stockQuantity: formData.stockQuantity,
      imageUrl: formData.imageUrl,
      images: formData.imageUrl ? [formData.imageUrl] : [],
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          placeholder="Title"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <label htmlFor="name">Title</label>
      </div>

      <div className="form-floating mb-3">
        <textarea
          className="form-control"
          id="description"
          name="description"
          placeholder="Description"
          style={{ height: '120px' }}
          value={formData.description}
          onChange={handleChange}
          required
        />
        <label htmlFor="description">Description</label>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="number"
              className="form-control"
              id="price"
              name="price"
              placeholder="Price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <label htmlFor="price">Price (₹)</label>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="number"
              className="form-control"
              id="stockQuantity"
              name="stockQuantity"
              placeholder="Quantity"
              min="1"
              value={formData.stockQuantity}
              onChange={handleChange}
              required
            />
            <label htmlFor="stockQuantity">Quantity</label>
          </div>
        </div>
      </div>

      <div className="form-floating mb-3">
        <select
          className="form-select"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <label htmlFor="category">Category</label>
      </div>

      <div className="form-floating mb-4">
        <input
          type="text"
          className="form-control"
          id="imageUrl"
          name="imageUrl"
          placeholder="Image URL"
          value={formData.imageUrl}
          onChange={handleChange}
        />
        <label htmlFor="imageUrl">Image URL</label>
      </div>

      {formData.imageUrl && (
        <div className="mb-4 text-center">
          <img
            src={formData.imageUrl}
            alt="Preview"
            className="img-fluid rounded shadow-sm"
            style={{ maxHeight: '200px', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      <button type="submit" className="btn btn-primary w-100 py-3" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

export default ListingForm;
