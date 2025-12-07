import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/blog/create', label: 'Create' },
    { path: '/blog', label: 'Explore' },
    { path: '/forum', label: 'Forum' },
    { path: '/resources', label: 'Resources' },
    { path: '/chat', label: 'Sakhi' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/profile', label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {!isCollapsed && <span className="logo-text">Diva</span>}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '' : ''}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-avatar">
              <span>{user?.username?.charAt(0).toUpperCase() || '👤'}</span>
            </div>
            <div className="user-details">
              <span className="user-name">{user?.username || 'User'}</span>
              <span className="user-status">Online</span>
            </div>
          </div>
        )}
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          {!isCollapsed ? 'Logout' : '🚪'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
