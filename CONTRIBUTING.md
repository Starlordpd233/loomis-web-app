# Contributing Guide

Thank you for contributing! 🎉

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Convention](#commit-convention)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/web_dev_lc.git
   cd web_dev_lc
   ```
3. Install dependencies:
   ```bash
   cd loomis-course-app
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Pick an issue or create one
2. Create feature branch from `main`
3. Make changes following code style
4. Add tests for new functionality
5. Run linter: `npm run lint`
6. Run tests: `npm test`
7. Commit following convention
8. Push and create PR

## Code Style

### TypeScript

- Strict mode enabled
- Use `interface` for object shapes, `type` for unions
- Avoid `any` - use `unknown` if necessary
- Prefer explicit return types
- Document public APIs with TSDoc comments

### React

- Functional components with hooks
- Props interface: `ComponentNameProps`
- File naming: `ComponentName.tsx`
- Custom hooks: `useHookName.ts`

### Styling

- Tailwind CSS utility classes
- No inline styles (except dynamic values)
- Custom components in `src/components/`

### File Organization

```
src/
├── app/           # Next.js pages (route groups)
├── components/    # Reusable UI components
├── lib/           # Utilities and helpers
└── types/         # TypeScript definitions
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(browser): add department filter
fix(planner): resolve grid slot overflow
docs(architecture): update system diagram
```

## Testing

See [TESTING.md](docs/TESTING.md) for full guide.

```bash
npm test              # All tests
npm run test:unit     # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report
```

**Coverage requirements:**

- Overall: 80% minimum
- Critical paths: 95% minimum

## Documentation

- Public APIs must have TSDoc comments
- Update [README.md](README.md) for user-facing changes
- Update [CHANGELOG.md](CHANGELOG.md) for version changes
- Update [docs/architecture.md](docs/architecture.md) for architectural changes

**TSDoc Example:**

```typescript
/**
 * Normalize raw catalog JSON to normalized Course[] array
 *
 * @param catalog - Raw catalog object with departments array
 * @returns Array of normalized Course objects with derived tags
 *
 * @example
 * ```ts
 * const courses = flattenDatabase(catalogData);
 * ```
 */
export function flattenDatabase(catalog: RawCatalog): Course[]
```

## Pull Request Process

1. **Before submitting:**
   - [ ] Code follows style guide
   - [ ] Tests added/updated
   - [ ] Docs updated
   - [ ] All tests pass
   - [ ] Linter passes

2. **PR Title:** Use conventional commit format

3. **Review requirements:**
   - At least 1 approval required
   - All CI checks must pass
   - No merge conflicts

## Documentation Maintenance

### Docs as Code

Documentation is version-controlled with code:

- Docs PRs require code review
- Markdown must pass linter
- All links must validate

### PR Template Checklist

When submitting a PR, check:

- [ ] I've updated relevant documentation
- [ ] Code examples are tested and runnable
- [ ] New APIs have TSDoc comments
- [ ] Breaking changes are noted in CHANGELOG.md

### Doc Freshness Audit

Quarterly, review all docs for:

- Outdated information
- Broken examples
- Dead links
- Missing new features

## Getting Help

- [Open an issue](https://github.com/your-org/web_dev_lc/issues)
- [Read architecture docs](docs/architecture.md)
- [Search existing issues](https://github.com/your-org/web_dev_lc/issues)

## Code of Conduct

Be respectful, constructive, and inclusive. We're here to build something great together.
