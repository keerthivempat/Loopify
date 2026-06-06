# Buy, Sell @ IIITH

A dedicated e-commerce platform exclusively for the IIIT Community built with MERN stack.

## Features

- **User Authentication**
  - Registration and Login with IIIT email validation
  - Session persistence
  - Secure password storage
  - Google reCAPTCHA integration

- **User Dashboard**
  - Profile management
  - Order history (pending, bought, sold)

- **Shopping Experience**
  - Product search with filters
  - Product details view
  - Shopping cart functionality

- **Support**
  - AI-powered chatbot for user assistance
  - Chat session persistence
  - Intelligent responses based on conversation context

- **Order Management**
  - OTP-based order verification system
  - Separate interfaces for buyers and sellers

## Tech Stack

- **MongoDB** - Database
- **Express.js** - Backend Framework
- **React.js** - Frontend Framework
- **Node.js** - Runtime Environment
- **Google reCAPTCHA** - Security feature
- **AI Integration** - Support chatbot (via third-party API)

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB

### Installation

1. **Clone the repository**

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Environment Variables**
   Create a `.env` file in the backend directory with:
   ```
  
   JWT_SECRET=your_jwt_secret
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
   RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   GEMINI_API_KEY=your_ai_model_api_key
   ```

## API Endpoints

- **Authentication**
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/logout

- **Users**
  - GET /api/users/profile
  - PUT /api/users/profile

- **Products**
  - GET /api/products
  - GET /api/products/:id
  - POST /api/products
  - DELETE /api/products/:id

- **Orders**
  - GET /api/orders
  - POST /api/orders
  - PUT /api/orders/:id/verify

- **Support**
  - POST /api/support/message
