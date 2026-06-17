# <p align="center">🌸 Diva 🌸</p>

### <p align="center">*Empowering Women through Connection, Support, and Community*</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-ff69b4.svg?style=for-the-badge&logo=react" alt="Status" />
  <img src="https://img.shields.io/badge/frontend-React-e91e63.svg?style=for-the-badge&logo=react" alt="Frontend" />
  <img src="https://img.shields.io/badge/backend-Node.js%20%2F%20Express-c2185b.svg?style=for-the-badge&logo=node.js" alt="Backend" />
  <img src="https://img.shields.io/badge/database-MongoDB-ad1457.svg?style=for-the-badge&logo=mongodb" alt="Database" />
</p>

---

<p align="center">
  <img src="client/public/empower_banner.png" alt="Diva Empower Cover" width="800" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(233, 30, 99, 0.15);" />
</p>

---

## 🎀 About Diva

**Diva** is a comprehensive, full-stack social welfare and community platform designed specifically for women. It facilitates a safe, positive, and supportive space for legal rights discussions, educational resources, relationship guidance, domestic support, and sisterhood. It comes equipped with secure user authentication, active feeds, real-time interactive blogs, a community Q&A forum, follow systems, and a dedicated contact/support portal.

---

## 💪 The Spirit of Diva: Empowerment & Unity

<p align="center">
  <img src="client/public/women_march.png" alt="Women Empowerment March" width="400" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border: 2px solid #ff69b4; margin: 16px 0;" />
</p>

> *"There is no limit to what we, as women, can accomplish."* — Michelle Obama

At **Diva**, we believe that when women support women, incredible things happen. True empowerment isn't just about individual success; it is about building bridges, sharing voices, and standing together in solidarity. Whether it's seeking advice on legal rights, sharing personal success stories, or finding support in difficult times, Diva provides the community space to uplift and inspire every woman to reach her full potential.

---

## 🌸 Key Features

*   **💗 Secure Auth & Profiles:** Sign up, sign in, JWT-based sessions, privacy controls, custom profile details, and profile images.
*   **🎀 Interactive Feed & Stories:** Post stories, see updates from followed users, get friend suggestions, and connect.
*   **🌷 Explore Blogs:** Read published blogs, manage draft posts, save favorites, and write with an intuitive editor.
*   **🍥 Community Forum:** Ask questions, search by topics, and share advice on Legal Rights, Education, Career, and more.
*   **💕 Live Support & Contact:** Securely share problems and concerns directly through our updated contact page, sending requests instantly to the administrator's email.
*   **💬 Support Chat & Help Desk:** Direct resources and assistance guides.

---

## 🎨 Color Palette (Pink Coded)

Diva's user experience is crafted around a cohesive and empowering pink theme:

*   **Primary Accent:** `#ff69b4` (Hot Pink)
*   **Secondary/Action:** `#e91e63` (Raspberry Pink) & `#c2185b` (Deep Magenta)
*   **Backgrounds:** `#ffffff` (White), `#f5f5f5` (Light Slate), and soft pink panels (`#fce4ec` & `#fff5f8`)
*   **Text Hierarchy:** `#ad1457` (Deep Raspberry for labels) & `#333333` (Charcoal body)

---

## 🛠️ Project Structure

```
diva/                    ← Repository Root
├── client/              ← React Single Page Application (SPA)
│   ├── public/          ← Public static assets & images
│   ├── src/             
│   │   ├── api/         ← API requests (divaApi.js)
│   │   ├── components/  ← Common layouts (Sidebar, Footer, Auth)
│   │   ├── context/     ← Global state (AuthContext)
│   │   └── pages/       ← Route-level page components (ContactUs, Feed, etc.)
│   └── package.json     
├── server/              ← Node.js + Express API Backend
│   ├── models/          ← Mongoose database schemas (User, Post, Forum)
│   └── index.js         ← Express server, routes, and DB connection
├── DEPLOY.md            ← Deployment checklist and production guides
└── package.json         ← Root npm scripts for concurrent local running
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **MongoDB** instance (local or Atlas)

### Local Setup in 3 Steps

1. **Install Dependencies:**
   Install both server and client libraries from the root folder:
   ```bash
   npm install
   cd server && npm install && cd ../client && npm install && cd ..
   ```

2. **Configure Environment Variables:**
   - In `server/`, create a `.env` file (or set environment variables on your machine):
     ```env
     PORT=4000
     MONGODB_URI=mongodb://localhost:27017/diva
     JWT_SECRET=your_jwt_secret_key_at_least_32_characters
     ```
   - In `client/`, check the environment files (`.env.development` / `.env.production`).

3. **Run the Application:**
   Start both backend and frontend concurrently with a single command from the root directory:
   ```bash
   npm run dev
   ```
   - **Client App:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:4000](http://localhost:4000)

---

## 📬 Contact Form Integration

The **Contact Us** page has been upgraded to connect directly to the administrator:
- **Backend Service:** Powered securely via AJAX calls to [FormSubmit.co](https://formsubmit.co).
- **Target Inbox:** `preetikaanjana@gmail.com`
- **User Experience:** Fully asynchronous submit (no redirects), instant loaders, field disablement during requests, and high-fidelity validation alerts styled beautifully matching the Diva pink theme.

---

## 📄 License
Developed for the **Diva** platform. All rights reserved.
