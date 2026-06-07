import React, { useState, useRef, useCallback } from 'react';
import { CATEGORIES } from '../constants/categories';
import { API_BASE } from '../utils/api';
import { ImagePlus, X, Upload } from 'lucide-react';

const ListingForm = ({ initialData = {}, onSubmit, submitLabel = 'Create Listing', isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price ?? '',
    category: initialData.category || CATEGORIES[0],
    stockQuantity: initialData.stockQuantity ?? 1,
  });

  // Image state
  const existingImageUrl = initialData.imageUrl || initialData.images?.[0] || '';
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(existingImageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stockQuantity' ? Number(value) : value,
    }));
  };

  const applyFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (jpg, png, gif, webp).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5 MB.');
      return;
    }
    setUploadError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => applyFile(e.target.files[0]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    applyFile(e.dataTransfer.files[0]);
  }, []);

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = existingImageUrl;

    // Upload new file if selected
    if (imageFile) {
      try {
        const fd = new FormData();
        fd.append('image', imageFile);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        imageUrl = data.imageUrl;
      } catch (err) {
        setUploadError(err.message || 'Image upload failed. Please try again.');
        return;
      }
    }

    onSubmit({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      stockQuantity: formData.stockQuantity,
      imageUrl,
      images: imageUrl ? [imageUrl] : [],
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

      <div className="form-floating mb-4">
        <select
          className="form-select"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <label htmlFor="category">Category</label>
      </div>

      {/* ── Image Upload ── */}
      <div className="mb-4">
        <label className="lf-upload-label">Product Image</label>

        {imagePreview ? (
          <div className="lf-preview-wrap">
            <img src={imagePreview} alt="Preview" className="lf-preview-img" />
            <button type="button" className="lf-preview-remove" onClick={clearImage} title="Remove image">
              <X size={16} />
            </button>
            <div className="lf-preview-change" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} /> Change photo
            </div>
          </div>
        ) : (
          <div
            className={`lf-dropzone${isDragging ? ' lf-dropzone--active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus size={36} className="lf-dropzone-icon" />
            <p className="lf-dropzone-text">
              <span className="lf-dropzone-link">Click to upload</span> or drag &amp; drop
            </p>
            <p className="lf-dropzone-hint">JPG, PNG, GIF, WEBP — max 5 MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {uploadError && <p className="lf-upload-error">{uploadError}</p>}
      </div>

      <button type="submit" className="btn btn-primary w-100 py-3" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

export default ListingForm;
