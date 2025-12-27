# Loomis Chaffee Course Planner

A Next.js web application for browsing the Loomis Chaffee course catalog and planning four-year academic schedules.

## Features

- **Course Browser** (`/browser`) - Search and filter the complete course catalog, build a shopping list of courses
- **Course Planner** (`/planner`) - Visual 4-year grid for planning your academic schedule
- **Onboarding** (`/onboarding`) - Initial setup wizard for new users

## Quick Start

```bash
# Install dependencies
cd loomis-course-app && npm install

# Start development server (runs on port 3001)
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Development Commands

```bash
# Development server
cd loomis-course-app && npm run dev

# Production build
cd loomis-course-app && npm run build

# Run linter
cd loomis-course-app && npm run lint

# Start production server
cd loomis-course-app && npm start
```

## Project Structure

```
web_dev_lc/
├── loomis-course-app/     # Main Next.js application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   │   ├── (marketing)/   # Landing and login pages
│   │   │   ├── (app)/         # Main app pages (browser, planner)
│   │   │   └── sandbox/       # Design experimentation area
│   │   ├── lib/           # Utilities (courseUtils, plannerStore)
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets and course catalog JSON
├── prep_data/             # Source materials for building catalog
├── design_ideas/          # UI/UX design exploration
└── README.md              # This file
```

## Navigation Flow

```
/ (Landing) → /login → /onboarding → /browser ↔ /planner
```

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** CSS Modules (main app), Tailwind CSS (sandbox)
- **State:** localStorage persistence with migration support

## Design Sandbox

The `/sandbox` route provides an isolated environment for prototyping new UI ideas using Tailwind CSS without affecting the main application styles.
