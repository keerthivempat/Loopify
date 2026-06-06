import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import ListingForm from './components/ListingForm';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditListing = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/items/${id}`);
        setItem(response.data);
      } catch (error) {
        alert('Listing not found');
        navigate('/my-listings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/items/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      navigate('/my-listings');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-white border-0 text-center pt-4">
                <h2 className="text-primary fw-bold mb-2">Edit Listing</h2>
                <p className="text-muted">Update your listing details</p>
              </div>
              <div className="card-body px-4 pb-5">
                <ListingForm
                  initialData={item}
                  onSubmit={handleSubmit}
                  submitLabel="Save Changes"
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

export default EditListing;
