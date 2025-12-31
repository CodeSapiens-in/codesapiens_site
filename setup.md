# Project Setup Guide

This guide provides detailed instructions on how to set up the CodeSapiens Management Website locally.

## Prerequisites

Ensure you have the following installed on your machine:
-   **Node.js**: Version 20.x or higher (LTS recommended). [Download Node.js](https://nodejs.org/)
-   **Git**: Version control system. [Download Git](https://git-scm.com/)
-   **VS Code**: Recommended code editor. [Download VS Code](https://code.visualstudio.com/)

You will also need accounts for:
1.  **Supabase**: For backend, database, and authentication.
2.  **Cloudinary**: For image storage and optimization.
3.  **Cloudflare Turnstile**: For CAPTCHA protection.

## Step-by-Step Installation

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/jayasurya261/Codesapiens_management_website.git
cd Codesapiens_management_website
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Environment Configuration

Create a local environment file by copying the example:

```bash
cp .env.example .env.local
```

Now, open `.env.local` in your editor and fill in the required keys:

#### Supabase Setup
1.  Create a new project on [Supabase](https://supabase.com/).
2.  Go to **Project Settings** -> **API**.
3.  Copy the **Project URL** to `VITE_SUPABASE_URL`.
4.  Copy the **anon public** key to `VITE_SUPABASE_ANON_KEY`.

#### Cloudinary Setup
1.  Create an account on [Cloudinary](https://cloudinary.com/).
2.  Go to your **Dashboard**.
3.  Copy the **Cloud Name**, **API Key**, and **API Secret** to their respective fields in `.env.local`.

#### Turnstile Setup
1.  Create an account on [Cloudflare](https://www.cloudflare.com/).
2.  Go to **Turnstile** in the sidebar.
3.  Add a new site (use `localhost` for local development).
4.  Copy the **Site Key** to `REACT_APP_TURNSTILE_SITE_KEY`.

#### Gemini AI Setup (Optional - For Resume Analysis)
1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Click **Get API key**.
3.  Create a key in a new project.
4.  Copy the key to `VITE_GEMINI_API_KEY` in `.env.local`.

#### QStash Setup (Optional - For Email Queueing)
1.  Create an account on [Upstash](https://upstash.com/).
2.  Create a new **QStash** project.
3.  Copy the **Token**, **URL**, **Current Signing Key**, and **Next Signing Key** to their respective fields in `.env.local`.

### 4. Database Initialization

This step is crucial for the application to function correctly.

1.  Go to your Supabase project dashboard.
2.  Open the **SQL Editor** from the sidebar.
3.  Open the `seed.sql` file from this project's root directory.
4.  Copy the entire content of `seed.sql`.
5.  Paste it into the Supabase SQL Editor.
6.  Click **Run**.

This will create all the necessary tables, triggers, and initial data.

**Important:** If you modify the database schema during development, remember to update `seed.sql`!

### 5. Start the Development Server

Now you are ready to run the application:

```bash
npm run dev
```

### 6. Start the Backend Server

The application requires the backend server to be running for API calls (email, etc.). Open a **new terminal** window/tab and run:

```bash
npm run server
```

The backend server should be running at `http://localhost:3001` (or the port specified in your `.env`).

The application should be running at `http://localhost:5173`.

## Troubleshooting

-   **"Relation does not exist" error**: Ensure you have run the `seed.sql` script in Supabase.
-   **Auth errors**: Verify your Supabase URL and keys in `.env.local`.
-   **Image upload fails**: Check your Cloudinary credentials.

Happy Coding! 🚀
