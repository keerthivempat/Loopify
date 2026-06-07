import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import LandingPage from './LandingPage';
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

/* Redirect authenticated users away from public-only pages */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/browse-listings" replace /> : children;
};

/* Redirect unauthenticated users to landing page */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public landing ── */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* ── Auth pages (redirect to browse if already logged in) ── */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Sign />
            </PublicRoute>
          }
        />

        {/* Legacy /auth route — redirect to landing */}
        <Route path="/auth" element={<Navigate to="/" replace />} />

        {/* ── Protected app routes ── */}
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
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
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
        <Route
          path="/orders-history"
          element={
            <ProtectedRoute>
              <OrdersHistory />
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
          path="/cart"
          element={
            <ProtectedRoute>
              <MyCart />
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

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
