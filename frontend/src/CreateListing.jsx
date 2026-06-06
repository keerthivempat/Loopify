import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ListingForm from './components/ListingForm';
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateListing = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to create a listing');
        navigate('/login');
        return;
      }

      await axios.post('http://localhost:5000/api/items', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      navigate('/my-listings', { state: { listingCreated: true } });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-white border-0 text-center pt-4">
                <h2 className="text-primary fw-bold mb-2">Create Listing</h2>
                <p className="text-muted">List an item for sale on Loopify</p>
              </div>
              <div className="card-body px-4 pb-5">
                <ListingForm
                  onSubmit={handleSubmit}
                  submitLabel="Create Listing"
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
