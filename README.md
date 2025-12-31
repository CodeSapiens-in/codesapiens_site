# Codesapiens Management Website

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Good First Issue](https://img.shields.io/badge/Good%20First%20Issue-Welcome-blue)](https://github.com/jayasurya261/Codesapiens_management_website/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)

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
├── public/                 # Static assets served as-is
├── src/                    # Application source code
│   ├── assets/             # Images, fonts, static JSON
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route-level pages/screens
│   ├── layouts/            # Layout wrappers (Navbar, Sidebar)
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React context providers
│   ├── services/           # API calls and external services
│   ├── utils/              # Helper functions and constants
│   ├── styles/             # Global styles and Tailwind layers
│   ├── routes/             # Route definitions
│   ├── App.jsx             # Root application component
│   └── main.jsx            # Vite entry point
├── .env.example            # Environment variable template
├── index.html              # HTML entry file
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config (if used)
├── postcss.config.js       # PostCSS config (if used)
├── eslint.config.js        # Linting rules
├── vercel.json             # Deployment config (optional)
└── README.md               # Documentation

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
- [Google AI Studio](https://aistudio.google.com/) (for Gemini API)
- [Upstash](https://upstash.com/) (for QStash)

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
```bash
npm run dev
```

### 5. Start Backend Server (Required for API)

Open a new terminal window and run:

```bash
node index.js
# OR
npm run server
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
