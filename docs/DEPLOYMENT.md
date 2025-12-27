# Deployment Guide

## Platforms

### Vercel (Recommended)

1. **Connect repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Configure project**
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment variables**
   - Add variables from `.env.example`
   - Mark sensitive variables as sensitive

4. **Deploy**
   - Vercel auto-deploys on push to main
   - Preview deployments for PRs

### Netlify

1. **Connect repository**
   - Go to [Netlify](https://netlify.com)
   - Import your GitHub repository

2. **Configure build**
   - Base Directory: `loomis-course-app`
   - Build Command: `npm run build`
   - Publish Directory: `.next`

3. **Environment variables**
   - Add variables in Netlify dashboard
   - Use same variables as local `.env`

4. **Deploy**
   - Auto-deploys on push
   - Preview deploys for PRs

### Docker

```bash
# Build image
docker build -t lc-course-planner .

# Run container
docker run -p 3000:3000 lc-course-planner

# Or use docker-compose
docker-compose up -d
```

**Dockerfile reference:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

Required variables (see `.env.example`):

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Production URL | Yes |
| `NEXT_PUBLIC_API_URL` | API endpoint (if applicable) | No |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID | No |

## Build for Production

```bash
cd loomis-course-app
npm run build
npm start
```

### Build Output

```
.next/
├── server/           # Server-side code
├── static/           # Static assets
└── cache/            # Build cache
```

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      # Add deployment steps for your platform
```

## Performance Optimization

- Enable **Incremental Static Regeneration** for catalog pages
- Use **Edge Functions** for dynamic features
- Compress images with `next/image`
- Enable **Caching** headers

## Monitoring

- Vercel Analytics (built-in)
- Error tracking (Sentry)
- Performance monitoring (DataDog, New Relic)

## Rollback

If deployment fails:

1. **Vercel/Netlify**: Previous deployment remains live
2. **Docker**: `docker-compose down && docker-compose up -d previous_image`
3. **Git**: `git revert <commit> && git push`
