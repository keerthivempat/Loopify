import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Sign from './Sign';
import Login from './Login';
import Profile from './Profile';
import Auth from './Auth';
import BrowseListings from './BrowseListings';
import MyListings from './MyListings';
import CreateListing from './CreateListing';
import EditListing from './EditListing';
import Wishlist from './Wishlist';
import ItemDetails from './ItemDetails';
import MyCart from './MyCart';
import DeliverItems from './DeliverItems';
import OrdersHistory from './OrdersHistory';
import Support from './Support';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Sign />} />
        <Route path="/register" element={<Sign />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <MyCart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders-history"
          element={
            <ProtectedRoute>
              <OrdersHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deliver-items"
          element={
            <ProtectedRoute>
              <DeliverItems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/:id"
          element={
            <ProtectedRoute>
              <ItemDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse-listings"
          element={
            <ProtectedRoute>
              <BrowseListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search-items"
          element={<Navigate to="/browse-listings" replace />}
        />
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-listings/edit/:id"
          element={
            <ProtectedRoute>
              <EditListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-listing"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
