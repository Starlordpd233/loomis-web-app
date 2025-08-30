# Loomis Chaffee Web Application Suite

This project contains three connected web applications:

1. **Landing Page** (Port 3002) - React/Vite application with landing page
2. **Login Page** (Port 3000) - Next.js application for authentication  
3. **Course Browser** (Port 3001) - Next.js application for course browsing

## Navigation Flow

Landing Page → Login Page → Course Browser

## Quick Start

### Option 1: Run All Applications (Recommended)

```bash
./start-all.sh
```

This will start all three applications simultaneously:
- Landing page at http://localhost:3002
- Login page at http://localhost:3000
- Course browser at http://localhost:3001

Press `Ctrl+C` to stop all applications.

### Option 2: Run Individual Applications

#### Landing Page Only
```bash
cd landing_page
npm run dev
```

#### Login Page Only
```bash
cd login_page
npm run dev
```

#### Course Browser Only
```bash
cd web
npm run dev
```

## Project Structure

```
web_dev_lc/
├── landing_page/          # React/Vite landing page (port 3002)
├── login_page/            # Next.js login application (port 3000)
├── web/                   # Next.js course browser (port 3001)
├── start-all.sh          # Script to run all applications
└── README.md             # This file
```

## Getting Started

1. Make sure all dependencies are installed:
   ```bash
   cd landing_page && npm install
   cd ../login_page && npm install  
   cd ../web && npm install
   ```

2. Run all applications:
   ```bash
   ./start-all.sh
   ```

3. Open http://localhost:3002 in your browser to start from the landing page

## Development Notes

- Each application runs on its own port to avoid conflicts
- The landing page redirects to the login page when "Get Started" is clicked
- The login page redirects to the course browser after login
- All applications can be stopped with `Ctrl+C` when using the startup script