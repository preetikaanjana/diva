import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Resources from './pages/Resources';
import Forum from './pages/Forum';
import Chat from './pages/Chat';
import ContactUs from './pages/ContactUs';
import CreatePost from './pages/CreatePost';
import Blog from './pages/Blog';
import CreateBlog from './pages/CreateBlog';
import BlogDetail from './pages/BlogDetail';
// import AboutMe from './pages/AboutMe';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Archive from './pages/Archive';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer';
import AskQuestion from './pages/AskQuestion';
import ChangePassword from './pages/ChangePassword';
import Privacy from './pages/Privacy';
import Help from './pages/Help';
import UserProfile from './pages/UserProfile';
import './App.css';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

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
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/profile/archive" element={
            <ProtectedRoute>
              <Archive />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <Feed />
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
          <Route path="/blog/:id" element={
            <ProtectedRoute>
              <BlogDetail />
            </ProtectedRoute>
          } />
          <Route path="/blog/create" element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          } />
          <Route path="/forum/ask" element={
            <ProtectedRoute>
              <AskQuestion />
            </ProtectedRoute>
          } />
          {false && (
            <Route path="/about" element={<div />} />
          )}
          <Route path="/forum/create" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />
          <Route path="/privacy" element={
            <ProtectedRoute>
              <Privacy />
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          } />
          <Route path="/user/:userId" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
        </Routes>
        {location.pathname === '/' && <Footer />}
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