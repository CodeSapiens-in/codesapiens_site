# Full-Stack Application

A complete full-stack application with separate frontend and backend services.

## Project Structure

```
project-root/
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   └── ...
├── frontend/
│   ├── package.json
│   ├── .env.local
│   └── ...
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ./backend
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```
   
3. Edit the `.env` file and add the necessary environment variables as shown in `.env.example`

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   nodemon index.js
   ```

The backend server will start and be available at the configured port (check your `.env` file for the PORT variable).

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ./frontend
   ```

2. Create environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   
3. Edit the `.env.local` file and add the necessary environment variables as shown in the example

4. Install dependencies (with legacy peer deps flag):
   ```bash
   npm install --legacy-peer-deps
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The frontend application will start and be available at the configured port (typically http://localhost:3000).

## Environment Variables

### Backend (.env)
Refer to `.env.example` file in the backend directory for all required environment variables.

### Frontend (.env.local)
Refer to the example environment variables and add the necessary configuration to your `.env.local` file.

## Development Workflow

1. Start the backend server first
2. Start the frontend development server
3. Both services should be running concurrently for full functionality

## Common Issues

- **Legacy Peer Dependencies**: The frontend uses `--legacy-peer-deps` flag to resolve dependency conflicts
- **Environment Variables**: Ensure all required environment variables are properly set in both `.env` files
- **Port Conflicts**: Make sure backend and frontend are configured to run on different ports

## Scripts

### Backend
- `nodemon index.js` - Start development server with auto-reload

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## Support

If you encounter any issues during setup, please check that:
1. All environment variables are correctly configured
2. Dependencies are properly installed
3. Both services are running on different ports
4. Node.js version is compatible

For additional help, please refer to the project documentation or create an issue.
