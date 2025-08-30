# Linking Module

This folder contains the minimal configuration used to navigate from the Login page to the Course Browser app.

How it works:

- `config.ts` exports `COURSE_BROWSER_URL`, pointing at the Course Browser dev server.
- The Login page imports this value and navigates to it on both buttons ("Continue with Loomis Account" and "Create New Account").

Development expectations:

- Run the Login app as usual:
  - In `login_page`: `npm run dev` (lands on `/login`).
- Run the Course Browser app on port 3001:
  - In `web`: `npm run dev` (configured to use `-p 3001`).

Environment override:

- You can override the URL via `NEXT_PUBLIC_COURSE_BROWSER_URL`, e.g.:
  - `NEXT_PUBLIC_COURSE_BROWSER_URL=http://localhost:4000 npm run dev`

This keeps the linking behavior isolated and easily adjustable without touching core page styling or logic.

