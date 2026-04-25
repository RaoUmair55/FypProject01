# Campusbuzz

A full-stack web application designed to connect campus community members and facilitate seamless communication and information sharing.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## ✨ Features

- **User Authentication**: Secure user registration and login with JWT token-based authentication
- **Community Interaction**: Connect with campus community members
- **Real-time Updates**: Stay updated with campus announcements and news
- **Responsive Design**: Modern, mobile-friendly interface
- **Password Security**: Encrypted passwords using bcryptjs

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose ODM (v8.14.0)
- **Authentication**: JSON Web Tokens (JWT v9.0.2)
- **Security**: 
  - bcryptjs for password hashing
  - CORS for cross-origin requests
  - Cookie-parser for secure cookie handling
- **Development**: Nodemon for hot-reload

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite (v6.3.1)
- **Styling**: Tailwind CSS (v4.1.4) with DaisyUI components
- **Routing**: React Router DOM (v7.5.2)
- **Data Fetching**: TanStack React Query (v5.75.0)
- **Notifications**: React Hot Toast (v2.5.2)
- **Icons**: React Icons (v5.5.0)
- **Linting**: ESLint with React plugin support

## 📁 Project Structure

```
Campusbuzz/
├── backend/
│   ├── controllers/          # Request handlers and business logic
│   ├── models/              # MongoDB schemas and models
│   ├── routes/              # API endpoint definitions
│   ├── middleware/          # Custom middleware (auth, error handling, etc.)
│   ├── db/                  # Database connection and configuration
│   ├── utills/              # Utility functions and helpers
│   └── server.js            # Express server entry point
├── frontend/
│   ├── src/                 # React components and application logic
│   ├── public/              # Static assets
│   ├── index.html           # HTML entry point
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── package.json         # Frontend dependencies
├── package.json             # Root package configuration
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance (local or cloud-based like MongoDB Atlas)

## 💾 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RaoUmair55/Campusbuzz.git
   cd Campusbuzz
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## ▶️ Running the Application

### Development Mode

**Start the backend server** (from root directory):
```bash
npm run dev
```

The backend will run on `http://localhost:5000` (or your configured port)

**Start the frontend development server** (in a new terminal):
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default)

### Production Mode

**Build the frontend**:
```bash
cd frontend
npm run build
```

**Start the production server** (from root directory):
```bash
npm start
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Backend Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campusbuzz
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile (requires authentication)

### Community Endpoints

- `GET /api/community` - Get community feed
- `POST /api/community/post` - Create a new post
- `GET /api/community/post/:id` - Get specific post
- `PUT /api/community/post/:id` - Update a post
- `DELETE /api/community/post/:id` - Delete a post

*Note: For detailed API documentation, refer to specific route files in `backend/routes/`*

## 🔧 Available Scripts

### Root Directory

- `npm run dev` - Start backend in development mode with hot-reload
- `npm start` - Start backend in production mode

### Frontend Directory

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint to check code quality

## 📝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support, email [your-email] or open an issue on GitHub.

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

---

**Happy coding!** 🎉
