# Loomis Chaffee Course Planner

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A Next.js web application for browsing the Loomis Chaffee course catalog and planning four-year academic schedules.

## Features

- **Course Browser** (`/browser`) - Search and filter the complete course catalog, build a shopping list of courses
- **Course Planner** (`/planner`) - Visual 4-year grid for planning your academic schedule
- **Onboarding** (`/onboarding`) - Initial setup wizard for new users
- **Design Sandbox** (`/sandbox`) - Isolated environment for UI prototyping

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/web_dev_lc.git
cd web_dev_lc

# Install dependencies
cd loomis-course-app
npm install

# Start development server (runs on port 3001)
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=
```

## Development Commands

```bash
# Development server
cd loomis-course-app && npm run dev

# Production build
npm run build

# Run linter
npm run lint

# Start production server
npm start
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
├── docs/                  # Documentation
│   ├── architecture.md    # System architecture
│   ├── API.md             # API reference
│   ├── DEPLOYMENT.md      # Deployment guide
│   ├── TESTING.md         # Testing guide
│   └── DECISIONS.md       # Architecture decisions
└── design_ideas/          # UI/UX design exploration
```

## Documentation

- [Architecture](docs/architecture.md) - System design and data flow
- [API Reference](docs/API.md) - Function and type documentation
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Deployment](docs/DEPLOYMENT.md) - Production deployment
- [Testing](docs/TESTING.md) - Testing guide

## Troubleshooting

**Issue:** Port 3001 already in use
**Solution:** `PORT=3002 npm run dev`

**Issue:** Build fails with "Module not found"
**Solution:** Ensure `npm install` ran successfully in loomis-course-app/

**Issue:** Changes not appearing
**Solution:** Check you're running `npm run dev`, not `npm start`

## Roadmap

- [ ] Add course prerequisites validation
- [ ] Export planner to PDF
- [ ] Mobile-responsive improvements
- [ ] User authentication integration

## Support

- [Open an issue](https://github.com/your-org/web_dev_lc/issues)
- [Read the docs](docs/)

## License

MIT © 2025 Loomis Chaffee Course Planner
