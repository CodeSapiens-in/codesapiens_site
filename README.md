<<<<<<< HEAD
# Codesapiens Management Website

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org/)

> A **JavaScript-based admin dashboard** for the **Codesapiens** platform. Manage users, projects, roles, and resources with a modern, responsive UI powered by **React 19**, **Tailwind CSS v4**, **Supabase**, and **Cloudinary**.

---

## 📑 Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Local Setup](#installation--local-setup)
- [Environment Variables](#environment-variables)
- [Usage & Commands](#usage--commands)
- [Authentication & Security](#authentication--security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)

---

## 🎯 Introduction

Welcome to the **Codesapiens Management Website** — the central admin interface for the [Codesapiens](https://github.com/jayasurya261/codesapiens) ecosystem.

This frontend application provides a **secure, intuitive, and real-time** admin panel to manage:

- Users & roles
- Projects & tasks
- Media assets
- System analytics

Built with modern tooling and best practices, it integrates seamlessly with **Supabase** (auth, DB, realtime) and **Cloudinary** (media), and supports deployment on **Vercel**, **Netlify**, or **GitHub Pages**.

---

## ✨ Key Features

- **Admin Dashboard** - Real-time analytics, widgets, notifications
- **User Management** - CRUD operations, role assignment, bulk actions, avatar upload
- **Project Management** - Full lifecycle management, milestones, file attachments
- **RBAC (Role-Based Access)** - Granular permissions (Admin, Moderator, Editor)
- **Real-Time Updates** - Live sync via Supabase Realtime
- **Media Handling** - Upload & optimize via Cloudinary
- **Secure Auth** - Supabase Auth + Turnstile CAPTCHA
- **Responsive UI** - Mobile-first, accessible
- **Audit Logs** - Track all admin actions
- **Export/Import** -  JSON Export

---

## 🛠️ Tech Stack

**Language:** JavaScript (ES6+)  
**Framework:** [React 19.1.1](https://react.dev/)  
**Styling:** [Tailwind CSS v4](https://tailwindcss.com/)  
**Build Tool:** [Vite](https://vitejs.dev/)  
**Backend:** [Supabase](https://supabase.com/) (Auth, DB, Realtime, Storage)  
**Media:** [Cloudinary](https://cloudinary.com/) 
**CAPTCHA:** [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)  
**State Management:** React Context / Zustand  
**Icons:** [Lucide React](https://lucide.dev/)

> Full dependency list available in [`package.json`](./package.json)

---

## 📁 Project Structure

```
Codesapiens_management_website/
├── .deepsource.toml (115 bytes)
├── .flowbite-react/
│   ├── class-list.json (2 bytes)
│   ├── config.json (189 bytes)
│   └── init.tsx (490 bytes)
├── .github/
│   └── workflows/
│       └── node.js.yml (844 bytes)
├── .gitignore (259 bytes)
├── ENVEXAMPLE (50 bytes)
├── README.md (3808 bytes)
├── eslint.config.js (763 bytes)
├── index.html (360 bytes)
├── package-lock.json (210603 bytes)
├── package.json (1372 bytes)
├── public/
│   ├── logo.jpg (25536 bytes)
│   └── vite.svg (1497 bytes)
├── src/
│   ├── App.jsx (4658 bytes)
│   ├── admin/
│   │   ├── AdminMeetup.jsx (9505 bytes)
│   │   ├── AdminMeetupEdit.jsx (6720 bytes)
│   │   ├── AdminMeetupList.jsx (10654 bytes)
│   │   ├── AdminMentorshipSubmission.jsx (22416 bytes)
│   │   ├── AdminScannerMeetup.jsx (7117 bytes)
│   │   ├── AllUserList.jsx (37582 bytes)
│   │   ├── AnalyticsPage.jsx (34761 bytes)
│   │   └── Dashboard.jsx (19458 bytes)
│   ├── assets/
│   │   ├── academic.json (2608 bytes)
│   │   ├── react.svg (4126 bytes)
│   │   └── skills.json (4265 bytes)
│   ├── components/
│   │   ├── AuthForm.jsx (22858 bytes)
│   │   ├── CodesapiensHero.jsx (35197 bytes)
│   │   ├── LumaEmbed.jsx (503 bytes)
│   │   ├── Navbar.jsx (23541 bytes)
│   │   ├── PublicProfile.jsx (14214 bytes)
│   │   ├── ResetPassword.jsx (3422 bytes)
│   │   ├── ResetPasswordConfirm.jsx (2013 bytes)
│   │   └── ui/
│   │       └── NotFoundPage.jsx (1511 bytes)
│   ├── index.css (114 bytes)
│   ├── lib/
│   │   ├── authContext.jsx (292 bytes)
│   │   ├── authFetch.js (960 bytes)
│   │   ├── supabaseClient.jsx (202 bytes)
│   │   └── useAuth.js (960 bytes)
│   ├── main.jsx (255 bytes)
│   └── user/
│       ├── UserCodingPlatform.jsx (7828 bytes)
│       ├── UserDashboard.jsx (18401 bytes)
│       ├── UserEvents.jsx (214 bytes)
│       ├── UserMeetup.jsx (10358 bytes)
│       ├── UserMeetupsList.jsx (11133 bytes)
│       ├── UserMentorshipForm.jsx (18732 bytes)
│       ├── UserMentorshipFormList.jsx (10321 bytes)
│       ├── UserPlayGround.jsx (2564 bytes)
│       ├── UserProfile.jsx (60884 bytes)
│       ├── UserResource.jsx (299 bytes)
│       └── UserResumeBuilder.jsx (307 bytes)
├── tailwind.config.js (961 bytes)
├── test-results/
│   └── .last-run.json (45 bytes)
├── vercel.json (70 bytes)
└── vite.config.js (529 bytes)

---
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS recommended: v20.x+)
- **npm** (v10+)
- **Git**

You'll also need accounts and API keys for:

- [Supabase](https://supabase.com/)
- [Cloudinary](https://cloudinary.com/)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)

Verify your installations:

```bash
node --version  # Should be >= 20
npm --version   # Should be >= 10
```

---

## 🚀 Installation & Local Setup

### 1. Clone the Repository

> **Note:** For a detailed step-by-step setup guide, including database initialization, please see [SETUP.md](./setup.md).

```bash
git clone https://github.com/jayasurya261/Codesapiens_management_website.git
cd Codesapiens_management_website
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys (see [Environment Variables](#environment-variables) section below).

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The app uses Vite HMR — changes will reflect instantly!

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory (never commit this file!):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-secret

# Cloudflare Turnstile
REACT_APP_TURNSTILE_SITE_KEY=0x4AAAAAA...

# Environment
NODE_ENV=development
```

**Important:** 
- Add `.env.local` to your `.gitignore`
- See `EXAMPLEENV` for a complete template
- Never commit sensitive keys to version control

---

## 💻 Usage & Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview production build locally |

---

## 🔒 Authentication & Security

### Authentication Flow

- **Login Page:** `/login` → Uses Supabase Auth (email/password)
- **Protected Routes:** All pages except login require authentication
- **Role-Based Access Control (RBAC):** User roles checked via `user.metadata.role`
- **Session Management:** Automatic token refresh, logout on timeout
- **CAPTCHA Protection:** Turnstile verification on registration/login

### Example: Auth Hook Usage

```javascript
import { useAuth } from './hooks/useAuth';

function AdminPage() {
  const { user, loading } = useAuth();
  
  if (loading) return <Spinner />;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return <Dashboard />;
}
```

---

## 🚢 Deployment

### Recommended: Vercel (Zero-Config)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Connect your repository to Vercel:**
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration
   - Deployment happens automatically

3. **Set environment variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.local`

### Alternative Platforms

| Platform | Build Command | Output Directory |
|----------|--------------|------------------|
| **Netlify** | `npm run build` | `dist` |
| **GitHub Pages** | `npm run build` | `dist` (use `gh-pages` branch) |
| **AWS Amplify** | `npm run build` | `dist` |

**Important:** Ensure all environment variables are configured in your deployment platform.

---

## 🤝 Contributing

We welcome contributions from the community!

### [Documentation - DeepWiKi](https://deepwiki.com/jayasurya261/Codesapiens_management_website)

### Contribution Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes**
  
4. **Commit your changes:**
   ```bash
   git commit -m "feat: add user export functionality"
   ```
5. **Push to your fork:**
   ```bash
   git push origin feat/your-feature-name
   ```
6. **Open a Pull Request** to the `main` branch

### Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Update documentation as needed
- **Important:** If you modify the database schema, you **MUST** update `seed.sql`.
- Be respectful and constructive in discussions

---

## 🐛 Troubleshooting

### Common Issues and Solutions

**npm install fails:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port already in use:**
Edit `vite.config.js`:
```javascript
export default {
  server: { port: 3000 }
}
```

**Supabase authentication errors:**
- Verify your Supabase URL and anon key in `.env`
- Check Row Level Security (RLS) policies in Supabase dashboard

**Images not uploading:**
- Verify Cloudinary API keys are correct
- Check browser console for CORS errors

**Tailwind styles not working:**
- Restart the dev server: `npm run dev`
- Clear Vite cache: `rm -rf node_modules/.vite`

**Build fails:**
```bash
rm -rf node_modules/.vite dist
npm install
npm run build
```

---

## 📄 License

This project is licensed under the **MIT License** – free to use, modify, and distribute.

See [LICENSE](./LICENSE) for details.

---

## 📧 Contact

**Maintainer:** [jayasurya261](https://github.com/jayasurya261)  
**Issues:** [GitHub Issues](https://github.com/jayasurya261/Codesapiens_management_website/issues)  
**Discussions:** [GitHub Discussions](https://github.com/jayasurya261/Codesapiens_management_website/discussions)

---

<div align="center">
  
**Made with ❤️ for the Codesapiens community**

[⬆ Back to Top](#codesapiens-management-website)

</div>
=======
# codesapiens_site
>>>>>>> 9d0e2a042371eceba8c13fcae32853f300934420
