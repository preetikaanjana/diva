import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Resources from './pages/Resources';
import Forum from './pages/Forum';
import Chat from './pages/Chat';
import ContactUs from './pages/ContactUs';
import CreatePost from './pages/CreatePost';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/forum/create" element={<CreatePost />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 