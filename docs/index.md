# Documentation

Welcome to the Loomis Chaffee Course Planner documentation.

## Quick Links

### For New Contributors

1. Read [README.md](../README.md) (2 min)
2. Read [CONTRIBUTING.md](../CONTRIBUTING.md) (5 min)
3. Read [Architecture](architecture.md) (10 min)
4. Start coding!

### For Users

- [Course Browser](/browser) - Browse and search courses
- [4-Year Planner](/planner) - Plan your schedule
- [Onboarding](/onboarding) - Set up your account

### For API Reference

- [Auto-generated API docs](api/) (TypeDoc)
- [TypeScript types](../loomis-course-app/src/types/course.ts)

### For Common Tasks

- [Adding a course](../CONTRIBUTING.md#adding-a-course)
- [Creating a sandbox experiment](../design_ideas/README.md)
- [Updating course data](../prep_data/README.md)
- [Deploying](DEPLOYMENT.md)

### For Understanding the System

- [Architecture overview](architecture.md)
- [Architecture decisions](DECISIONS.md)
- [Testing guide](TESTING.md)

## Documentation Map

```
├── Getting Started
│   ├── README.md              # Project overview
│   └── CONTRIBUTING.md        # Contribution guide
│
├── Architecture
│   ├── architecture.md        # System design & diagrams
│   └── DECISIONS.md           # Architecture Decision Records
│
├── Development
│   ├── API.md                 # API reference index
│   ├── api/                   # Auto-generated docs (TypeDoc)
│   ├── TESTING.md             # Testing practices
│   └── DEPLOYMENT.md          # Production deployment
│
├── Data
│   ├── prep_data/README.md    # Course data pipeline
│   └── design_ideas/README.md # Sandbox workflow
│
└── Legal
    ├── LICENSE                # MIT License
    ├── CHANGELOG.md           # Version history
    └── SECURITY.md            # Security policy
```

## Can't Find What You Need?

1. Search this repo with GitHub's code search
2. Open an issue with the "documentation" label
3. Ask in a discussion

## Contributing to Docs

This documentation is maintained as part of the codebase. See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to improve these docs.

### Doc Style Guide

- Use clear, concise language
- Include code examples where helpful
- Keep diagrams up to date
- Link to related documentation
- Use markdown formatting consistently

### Updating Docs

1. Edit the relevant `.md` file
2. Add entry to [CHANGELOG.md](../CHANGELOG.md) if significant
3. Run linting to check for broken links
4. Create a PR following contribution guidelines

## Meta

**Maintained by:** Project contributors
**Last Updated:** December 2025
**Version:** 1.0.0

For license and copyright information, see [LICENSE](../LICENSE).
