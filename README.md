# Loopify - Second-Hand Marketplace

Loopify is a modern, responsive, full-stack second-hand marketplace application built using the MERN stack (MongoDB, Express, React, Node.js). It allows users to list items for sale, browse listings, manage a shopping cart, place orders, and communicate directly with sellers — all powered by an AI assistant.

## Features

* **User Authentication & Profiles:** Secure registration and login with JWT and Google reCAPTCHA integration. Manage user profiles with avatars and contact info.
* **Listing Management:** Create, edit, and delete product listings. Includes image uploads handled via Cloudinary and Multer.
* **Shopping Experience:** Browse items, add to cart, and manage wishlists.
* **Order Processing:** Seamless order creation and management system with OTP-based handover verification.
* **Seller Inquiries:** Built-in messaging system for buyers and sellers to communicate directly regarding items. Sellers can accept or reject inquiries and share contact details.
* **Loopify AI — Gemini-Powered Chatbot:** An intelligent AI assistant embedded in the marketplace, powered by Google Gemini (`gemini-2.5-flash`). It can:
  * Discover products from live inventory using natural language — *"Find budget phones"*
  * Draft polite buyer inquiry messages
  * Suggest seller reply options
  * Answer platform navigation questions
  * Share sustainability tips about pre-owned shopping
  * Gracefully falls back to rule-based responses when the LLM is unavailable
* **Statistics & Dashboard:** View live marketplace stats (listings, users, wishlist savers) and manage active listings.

## Tech Stack

### Frontend
* **Framework:** React 18 with Vite
* **Styling & UI:** React-Bootstrap, Bootstrap 5, Lucide React icons
* **Routing:** React Router DOM v7
* **API calls:** Axios
* **AI Widget:** Custom `AIChatWidget` component using Gemini via the backend API

### Backend
* **Server:** Node.js, Express
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JWT (JSON Web Tokens), bcryptjs for password hashing
* **File Uploads:** Multer
* **AI Integration:** `@google/generative-ai` (Google Gemini) with multi-model fallback and rule-based degradation

## Project Structure

This is a monorepo setup containing both frontend and backend directories.

```text
Loopify/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # API logic (including aiController.js)
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes (including aiRoutes.js)
│   │   ├── services/       # aiService.js — Gemini/OpenAI provider layer
│   │   └── app.js          # App configuration and route mounting
│   ├── server.js           # Entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI (AIChatWidget, ListingCard, etc.)
    │   ├── utils/api.js    # Centralised API base URL
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Setup & Installation

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB database (local or MongoDB Atlas)
* Google Gemini API key — get one free at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/keerthivempat/Loopify.git
cd Loopify
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# AI — Google Gemini (required for chatbot)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key

# CORS — set to your deployed frontend URL in production
FRONTEND_URL=https://your-frontend-url.com
```

Start the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
# Point to local backend for development
VITE_API_BASE=http://localhost:5000/api
```

> In production, set `VITE_API_BASE` to your deployed backend URL (e.g. `https://your-backend.onrender.com/api`).

Start the frontend:
```bash
npm run dev
```

## AI Chatbot Details

The `POST /api/ai/chat` endpoint powers the Loopify AI widget. It:

1. Fetches up to 30 live listings from MongoDB to inject as context
2. Sends the conversation history + inventory to Google Gemini
3. Returns a natural language reply + up to 4 matching listing cards
4. Falls back through multiple Gemini models (`gemini-2.5-flash` → `gemini-2.0-flash-lite` → ...) on quota/503 errors
5. Falls back to rule-based responses if all LLM calls fail — so the widget never shows a hard error

## Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
