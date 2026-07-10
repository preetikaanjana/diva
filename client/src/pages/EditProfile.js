import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import * as api from '../api/divaApi';
import './CreateBlog.css'; 

function EditProfile() {
  const { user, logout, updateUser } = useAuth(); 
  const { t } = useLanguage();
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
        alert(t('Failed to save profile. Please try again.'));
        setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = window.prompt(t("To verify your identity, please enter your password to delete your account:"));
    if (password === null) return;
    if (!password.trim()) {
      alert(t("Password is required to delete your account."));
      return;
    }

    if (window.confirm(t("ARE YOU ABSOLUTELY SURE? This action is permanent and cannot be undone."))) {
      setSubmitting(true);
      try {
        await api.deleteAccount(password);
        alert(t("Your account has been successfully deleted. We are sorry to see you go."));
        logout();
        navigate('/');
      } catch (err) {
        alert(t(err.message) || t("Failed to delete account. Please verify your password."));
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="create-blog-wrapper">
      <h1 className="create-blog-title">{t("Edit Profile")}</h1>

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
                 {t("Change Photo")}
             </button>
        </div>

        {/* Username */}
        <div>
          <label className="field-label">{t("Username")}</label>
          <input 
            className="text-input" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="field-label">{t("Full Name")}</label>
          <input 
            className="text-input" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
          />
        </div>

        {/* Email */}
        <div>
          <label className="field-label">{t("Email Address")}</label>
          <input 
            className="text-input" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div>
          <label className="field-label">{t("Phone")}</label>
          <input
            className="text-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("Optional")}
          />
        </div>

        <div>
          <label className="field-label">{t("Location")}</label>
          <input
            className="text-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("Optional")}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="field-label">{t("Bio")}</label>
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
            {t("Cancel")}
          </button>
          
          <button 
            type="submit" 
            className="publish-btn" 
            disabled={submitting}
          >
            {submitting ? t('Saving...') : t('Save Changes')}
          </button>
        </div>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ffccde' }}>
          <h3 style={{ color: '#c2185b', fontSize: '18px', marginBottom: '10px' }}>{t("Danger Zone")}</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
            {t("Deleting your account is permanent. All your blogs, stories, questions, and connections will be deleted forever.")}
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            style={{
              backgroundColor: '#fff',
              border: '2px solid #e91e63',
              borderRadius: '8px',
              color: '#e91e63',
              padding: '10px 16px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e91e63';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.color = '#e91e63';
            }}
          >
            🗑️ {t("Delete Account")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;