# Loopify - Second-Hand Marketplace

Loopify is a modern, responsive, full-stack second-hand marketplace application built using the MERN stack (MongoDB, Express, React, Node.js). It allows users to list items for sale, browse listings, manage a shopping cart, place orders, and communicate directly with sellers.

## Features

* **User Authentication & Profiles:** Secure registration and login with JWT and Google reCAPTCHA integration. Manage user profiles with avatars and contact info.
* **Listing Management:** Create, edit, and delete product listings. Includes image uploads handled via Cloudinary and Multer.
* **Shopping Experience:** Browse items, add to cart, and manage wishlists.
* **Order Processing:** Seamless order creation and management system.
* **Real-time Chat & Inquiries:** Built-in messaging system using `@chatscope/chat-ui-kit-react` for buyers and sellers to communicate directly regarding items.
* **AI Features:** Integration with OpenAI and Google Generative AI for enhanced listing capabilities.
* **Statistics & Dashboard:** View personalized user statistics and manage active listings.

## Tech Stack

### Frontend
* **Framework:** React 18 with Vite
* **Styling & UI:** React-Bootstrap, Bootstrap 5, Shadcn UI, Tailwind CSS, Lucide React icons
* **Routing:** React Router DOM v7
* **State Management/API calls:** Axios
* **Other Tools:** React Google reCAPTCHA, Chat-UI-Kit

### Backend
* **Server:** Node.js, Express
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JWT (JSON Web Tokens), bcryptjs for password hashing
* **File Uploads:** Multer, Cloudinary
* **AI Integrations:** `@google/generative-ai`, `openai`

## Project Structure

This is a monorepo setup containing both frontend and backend directories.

```text
Loopify/
├── backend/            # Express Node.js server
│   ├── src/
│   │   ├── config/     # Database configurations
│   │   ├── controllers/# API logic
│   │   ├── middleware/ # Custom Express middlewares (Auth, Error Handling)
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/     # Express routes
│   │   └── app.js      # App configuration and mounting
│   ├── server.js       # Entry point
│   └── package.json
└── frontend/           # React application built with Vite
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Page level components
    │   ├── App.jsx     # Main React component
    │   └── main.jsx    # React DOM render entry
    └── package.json
```

## Setup & Installation

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB database (local or MongoDB Atlas)
* Cloudinary Account (for image uploads)
* Google reCAPTCHA keys (for signup validation)

### 1. Clone the Repository
```bash
git clone <https://github.com/keerthivempat/Loopify.git>
cd Loopify
```

### 2. Backend Setup
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# Add other required keys like OPENAI_API_KEY if needed
```

Start the backend server (development mode):
```bash
npm run dev # or npm start
```

### 3. Frontend Setup
Open a new terminal, navigate to the `frontend` directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory with the following variables:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RECAPTCHA_SITE_KEY=your_google_recaptcha_site_key
```

Start the frontend development server:
```bash
npm run dev
```

## Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
