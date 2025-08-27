# Devi - React Social Platform

A complete React application with authentication, profile management, and social features built with modern web technologies.

## Features

### 🔐 Authentication System
- **Login Page**: Clean, responsive login form with email/password
- **Signup Page**: User registration with validation
- **Protected Routes**: Secure access to user-specific content
- **Local Storage**: Persistent authentication state

### 👤 Profile Management
- **Profile Page**: Instagram-style profile layout
- **User Stats**: Posts, followers, following counts
- **Profile Tabs**: Grid, bookmarks, and tagged content views
- **Blog Sharing**: "Share a Blog" functionality instead of photos

### 🧭 Navigation
- **Responsive Sidebar**: Collapsible left navigation
- **Navigation Links**: Home, Forum, Blog, About Me, Resources, Chat, Contact
- **User Info**: Display current user information
- **Logout Functionality**: Secure logout with context management

### 📝 Blog System
- **Blog Page**: Grid layout with blog cards
- **Categories**: Filter blogs by technology categories
- **Sorting**: Latest, oldest, and popular sorting options
- **Responsive Design**: Mobile-friendly blog grid

### 🎨 Design & UI
- **Color Palette**: Consistent with existing website design
- **Modern UI**: Clean, minimalist interface
- **Responsive Design**: Works on all device sizes
- **Smooth Animations**: Hover effects and transitions

## Technology Stack

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Context API**: State management for authentication
- **CSS3**: Custom styling with responsive design
- **Local Storage**: Client-side data persistence

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   └── Auth.css
│   ├── Sidebar/
│   │   ├── Sidebar.js
│   │   └── Sidebar.css
│   ├── Navbar.js
│   └── Footer.js
├── pages/
│   ├── Profile.js
│   ├── Profile.css
│   ├── Blog.js
│   ├── Blog.css
│   ├── AboutMe.js
│   ├── AboutMe.css
│   └── ... (other existing pages)
├── context/
│   └── AuthContext.js
├── App.js
└── App.css
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

### Authentication Flow
1. **First Visit**: Users see public pages (Home, Blog, About, etc.)
2. **Login/Signup**: Users can create accounts or sign in
3. **Protected Access**: After authentication, users see the sidebar and can access their profile
4. **Profile Management**: Users can view their profile, stats, and manage content

### Navigation
- **Sidebar**: Left-side navigation with collapsible design
- **Profile Access**: Click on profile or use `/profile` route
- **Logout**: Use the logout button in the sidebar

### Blog Features
- **View Blogs**: Browse all available blog posts
- **Filtering**: Sort by category and date
- **Create Blogs**: "Create New Blog" button (functionality to be implemented)

## Color Palette

The application uses a consistent color scheme:
- **Primary**: `#ff69b4` (Pink)
- **Secondary**: `#e91e63` (Darker Pink)
- **Background**: `#fff`, `#f5f5f5` (White, Light Gray)
- **Text**: `#333`, `#666` (Dark Gray, Medium Gray)
- **Accents**: `#fff0f5`, `#ffe4e1` (Light Pink variations)

## Responsive Design

- **Desktop**: Full sidebar with expanded navigation
- **Tablet**: Responsive sidebar with mobile considerations
- **Mobile**: Collapsible sidebar with touch-friendly interactions

## Future Enhancements

- [ ] Real backend API integration
- [ ] Blog creation and editing
- [ ] User search and following
- [ ] Real-time chat functionality
- [ ] Image upload and management
- [ ] Advanced profile customization
- [ ] Notification system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Devi platform and follows the same licensing terms.

---

**Note**: This is a frontend-only implementation. For production use, integrate with a backend API for user authentication, data persistence, and real-time features.
