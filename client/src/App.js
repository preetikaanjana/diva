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
import Blog from './pages/Blog';
import CreateBlog from './pages/CreateBlog';
import BlogDetail from './pages/BlogDetail';
import BlogDrafts from './pages/BlogDrafts';
import ForumDetail from './pages/ForumDetail';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './pages/ForgotPassword';
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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  const showSidebar = isAuthenticated && location.pathname !== '/';

  return (
    <div className="App">
      {/* Sidebar: logged-in users only, hidden on landing page (/) */}
      {showSidebar && <Sidebar />}

      <div className={`main-content ${showSidebar ? 'with-sidebar' : 'without-sidebar'}`}>
        <Routes>
          {/* Home page - shows existing front page with login options */}
          <Route path="/" element={<Home />} />
          
          {/* Auth routes - accessible from home page, no sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
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
          <Route path="/forum/ask" element={
            <ProtectedRoute>
              <AskQuestion />
            </ProtectedRoute>
          } />
          <Route path="/forum/:id" element={
            <ProtectedRoute>
              <ForumDetail />
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
          <Route path="/blog/create" element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          } />
          <Route path="/blog/drafts" element={
            <ProtectedRoute>
              <BlogDrafts />
            </ProtectedRoute>
          } />
          <Route path="/blog/:id" element={
            <ProtectedRoute>
              <BlogDetail />
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