import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Resources from './pages/Resources';
import Forum from './pages/Forum';
import Chat from './pages/Chat';
import ContactUs from './pages/ContactUs';
import CreatePost from './pages/CreatePost';
import Blog from './pages/Blog';
import AboutMe from './pages/AboutMe';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer';
import './App.css';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/" />;
  };

  return (
    <div className="App">
      {/* Sidebar only shows after authentication */}
      {isAuthenticated && <Sidebar />}
      
      <div className={`main-content ${isAuthenticated ? 'with-sidebar' : 'without-sidebar'}`}>
        <Routes>
          {/* Home page - shows existing front page with login options */}
          <Route path="/" element={<Home />} />
          
          {/* Auth routes - accessible from home page, no sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes - only accessible when logged in, with sidebar */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          } />
          <Route path="/forum" element={
            <ProtectedRoute>
              <Forum />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/contact" element={
            <ProtectedRoute>
              <ContactUs />
            </ProtectedRoute>
          } />
          <Route path="/blog" element={
            <ProtectedRoute>
              <Blog />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <AboutMe />
            </ProtectedRoute>
          } />
          <Route path="/forum/create" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App; 