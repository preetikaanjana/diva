import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/divaApi';
import './CreateBlog.css'; 

function EditProfile() {
  // We need 'login' (or a specific updateUser function) to update the global state
  const { user, updateUser } = useAuth(); 
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State for profile fields
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  
  // State for the profile image (preview)
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); // Base64 string of the image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
        const updatedUser = await api.updateMe({
          username,
          fullName,
          email: email.trim().toLowerCase(),
          bio,
          phone,
          city,
          profileImage
        });
        updateUser(updatedUser);
        setTimeout(() => {
            setSubmitting(false);
            navigate('/profile');
        }, 400);
    } catch (error) {
        console.error("Failed to save profile", error);
        alert(error.message || 'Failed to save profile. Please try again.');
        setSubmitting(false);
    }
  };

  return (
    <div className="create-blog-wrapper">
      <h1 className="create-blog-title">Edit Profile</h1>

      <form className="create-blog-card-wide" onSubmit={handleSave}>
        
        {/* --- PROFILE PICTURE SECTION --- */}
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '20px' 
        }}>
             <div style={{ 
                 width: '110px', 
                 height: '110px', 
                 borderRadius: '50%', 
                 backgroundColor: '#fff0f6', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 fontSize: '36px',
                 fontWeight: 'bold',
                 border: '3px solid #e91e63', 
                 color: '#e91e63',
                 marginBottom: '8px',
                 overflow: 'hidden' 
             }}>
                 {profileImage ? (
                   <img 
                     src={profileImage} 
                     alt="Profile" 
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                   />
                 ) : (
                   <span>{username.charAt(0).toUpperCase()}</span>
                 )}
             </div>

             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               style={{ display: 'none' }} 
               accept="image/*"
             />

             <button 
                type="button" 
                onClick={handlePhotoClick}
                style={{ 
                     background: 'none', 
                     border: 'none', 
                     color: '#e91e63', 
                     fontWeight: '700',
                     fontSize: '15px',
                     cursor: 'pointer',
                     padding: '5px',
                     textDecoration: 'underline'
                 }}
             >
                 Change Photo
             </button>
        </div>

        {/* Username */}
        <div>
          <label className="field-label">Username</label>
          <input 
            className="text-input" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="field-label">Full Name</label>
          <input 
            className="text-input" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
          />
        </div>

        {/* Email */}
        <div>
          <label className="field-label">Email</label>
          <input 
            className="text-input" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div>
          <label className="field-label">Phone</label>
          <input
            className="text-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="field-label">City / location</label>
          <input
            className="text-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Optional"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="field-label">Bio</label>
          <textarea 
            className="content-input" 
            rows={4}
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            style={{ 
                minHeight: '100px',
                width: '100%',
                padding: '14px',
                border: '1px solid #ff80ab',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Buttons */}
        <div className="button-group-wide">
          <button 
            type="button" 
            className="save-draft-btn" 
            onClick={() => navigate('/profile')}
            disabled={submitting}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="publish-btn" 
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default EditProfile;