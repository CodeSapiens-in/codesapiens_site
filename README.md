<p align="center">
  <img src="public/logo.jpg" alt="CodeSapiens Logo" width="100" height="100" style="border-radius: 20px;" />
</p>

<h1 align="center">CodeSapiens Community</h1>

<p align="center">
  <strong>TN's Biggest Student Tech Ecosystem — Building the Future, Together.</strong>
</p>

<p align="center">
  <a href="https://github.com/Codesapiens-in/codesapiens_site/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
  </a>
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS 4" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0050?logo=framer&logoColor=white" alt="Framer Motion 12" />
  <img src="https://img.shields.io/badge/Supabase-BaaS-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Express Backend" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

---

## ✨ Features

### 🎨 Quantum Light Design System
- **Premium light theme** with pristine whites, cloud grays, and soft cyan-to-blue gradients
- **Glassmorphic UI elements** — frosted glass nav, cards with `backdrop-blur` and soft elevation shadows
- **Generative particle background** with interactive cursor-responsive particles
- **Custom animated cursor** for immersive browsing experience

### 🎬 MeritFirst-Inspired Motion Design
- **Grid-Blast Shatter Transition** — Full-screen event images split into 40 tiles (8×5) that blast outward on scroll with randomized rotation, scale, and position transforms
- **Sticky Stack Cards** — Event images stack like a deck on scroll, each shattering to reveal the next
- **Per-Letter Scroll Color Transition** — "Building Community Since 2023" text where each letter transitions from gray to dark/blue as you scroll, inspired by MeritFirst's "Hire on Merit" section
- **Beam-Spin Border Animation** — CTA buttons with rotating conic-gradient borders
- **Spring physics** and staggered entrance animations throughout

### 📱 Core Sections
| Section | Description |
|---------|-------------|
| **Hero** | Large-scale typography with floating glass nav and animated stats |
| **Vision** | Community mission with scroll-reveal cards |
| **Programs** | Tech programs and learning tracks |
| **Community Moments** | Full-screen sticky-stack + grid-shatter photo gallery |
| **Mafia Gang** | Team showcase with premium stacking card effect |
| **Sponsors & Partners** | Logo marquees and partnership highlights |
| **Social Feed** | Live social media integration |
| **Building Community** | Scroll-driven per-letter color transition |
| **Next When?** | Premium CTA with pulsing indicator and beam-spin button |

### 🔧 Backend Features
- **Express.js API** with RESTful endpoints
- **Supabase** integration for auth, database, and real-time updates
- **Community event management** with photo gallery
- **Form builder** with dynamic submissions
- **QR code** generation and scanning
- **Email notifications** via Nodemailer

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.1 | UI framework |
| Vite | 7.1 | Build tool & dev server |
| TailwindCSS | 4.1 | Utility-first CSS |
| Framer Motion | 12.23 | Animations & scroll effects |
| Lucide React | 0.540 | Icon system |
| React Router | 7.8 | Client-side routing |
| Lenis | 1.3 | Smooth scroll |
| p5.js | 2.2 | Generative art backgrounds |
| Recharts | 3.1 | Data visualization |

### Backend
| Technology | Purpose |
|-----------|---------|
| Express.js | REST API server |
| Supabase | Auth, database, storage |
| Nodemailer | Email services |
| Vercel Blob | File storage |
| Upstash QStash | Queue & scheduling |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Supabase** project (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/Codesapiens-in/codesapiens_site.git
cd codesapiens_site

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3000
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_key
```

### Development

```bash
# Start the frontend dev server
npm run dev

# Start the backend server (separate terminal)
npm run server:dev

# Or start both
npm run dev & npm run server:dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## 📁 Project Structure

```
codesapiens_site/
├── public/                  # Static assets (images, logo, fonts)
├── src/
│   ├── components/
│   │   ├── CodeSapiensHero.jsx    # Main landing page (all sections)
│   │   ├── GenerativeBackground.jsx # p5.js particle system
│   │   ├── CustomCursor.jsx        # Animated cursor
│   │   ├── Marquee.jsx             # Infinite scroll marquee
│   │   ├── LandingPopup.jsx        # Welcome popup
│   │   └── ...                     # Other components
│   ├── lib/
│   │   ├── supabaseClient.js       # Supabase initialization
│   │   └── authFetch.js            # Authenticated API calls
│   ├── config.js                    # App configuration
│   ├── App.jsx                      # Root component & routing
│   └── index.css                    # Global styles & design tokens
├── Backend-Express/          # Express.js API server
├── scripts/                  # Utility scripts
├── tailwind.config.js        # Tailwind configuration
├── vite.config.js            # Vite configuration
├── vercel.json               # Vercel deployment config
└── package.json
```

---

## 🎨 Design Philosophy

### Quantum Light Aesthetic
The design draws inspiration from **MeritFirst**, **Dreelio**, and modern editorial websites:

- **Typography**: Display fonts paired with clean body text for editorial impact
- **Color**: Dominant white canvas with quantum blue (`#2563EB`) and cyan accents
- **Motion**: Every interaction is intentional — spring physics for snappy feedback, scroll-linked transforms for immersive storytelling
- **Space**: Generous whitespace with asymmetric layouts that break conventional grid patterns

### Performance Principles
- **Transform-only animations** — No layout-triggering properties
- **`will-change` optimization** for scroll-heavy sections
- **Lazy loading** for images and heavy components
- **Code splitting** with Vite's dynamic imports

---

## 🖼 Screenshots

> Scroll through the landing page to experience the full suite of animations and effects.

| Section | Effect |
|---------|--------|
| Community Moments | Sticky-stack cards with grid-blast shatter transition |
| Building Community | Per-letter scroll color transition |
| Next When? | Beam-spin CTA with spring hover physics |
| Mafia Gang | Premium stacking card reveals |

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

See the [issue template](issue_template.md) and [contribution template](contribute_template.md) for more details.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

| Platform | Link |
|----------|------|
| 🌐 Website | [codesapiens.in](https://codesapiens.in) |
| 🐙 GitHub | [Codesapiens-in](https://github.com/Codesapiens-in) |
| 💼 LinkedIn | [CodeSapiens Community](https://www.linkedin.com/company/codesapiens-community/) |
| 🎥 YouTube | [@codesapiens-in](https://youtube.com/@codesapiens-in) |

---

<p align="center">
  <sub>
    <strong>Developed by Joshua Ragiland M</strong>
    <br />
    Built with ❤️ for the CodeSapiens Community
    <br /><br />
    <img src="https://img.shields.io/badge/Developed_by-Joshua_Ragiland_M-2563EB?style=for-the-badge&labelColor=0f172a" alt="Developed by Joshua Ragiland M" />
  </sub>
</p>

<p align="center">
  <sub>© 2025 CodeSapiens Community. All rights reserved.</sub>
</p>
