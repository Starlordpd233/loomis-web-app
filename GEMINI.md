# Loomis Chaffee Course Planner

## Project Overview
This is a Next.js web application designed to help students of Loomis Chaffee browse the course catalog and plan their four-year academic schedule. It replaces manual PDF-based planning with an interactive digital tool.

**Key Features:**
- **Course Browser (`/browser`):** Search, filter, and select courses from the full catalog.
- **Course Planner (`/planner`):** A visual grid for mapping courses to specific years and terms.
- **Onboarding (`/onboarding`):** Initial setup for new users.
- **Design Sandbox (`/sandbox`):** An isolated environment for UI prototyping.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS and CSS Modules
- **State Management:** `localStorage` (persisted client-side state)
- **Icons:** `lucide-react`

## Building and Running
The application is located in the `loomis-course-app` directory.

### Commands
*Run these commands from the `loomis-course-app` directory.*

- **Install Dependencies:**
  ```bash
  npm install
  ```
- **Start Development Server:**
  ```bash
  npm run dev
  # Runs on http://localhost:3001
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Start Production Server:**
  ```bash
  npm run start
  ```
- **Lint Code:**
  ```bash
  npm run lint
  ```

## Data Structure
The course catalog is stored in `public/catalog.json` (and other fallback paths). The data structure is handled by `src/lib/courseUtils.ts`.

### JSON Format
The raw JSON is structured by department:
```json
{
  "departments": [
    {
      "department": "Department Name",
      "courses": [ ...list of courses... ]
    },
    {
      "department": "Languages",
      "courses": {
        "Chinese": [ ... ],
        "French": [ ... ]
      }
    }
  ]
}
```

### Course Object Model
A normalized `Course` object (after processing) typically includes:
- `title`: String
- `description`: String
- `department`: String
- `rigor`: Number (1=Regular, 2=Advanced, 3=College Level/CL)
- `level`: Derived string ("CL", "ADV")
- `gesc`: Boolean (Global & Environmental Studies Certificate)
- `ppr`: Boolean (Philosophy, Psychology, Religion)
- `termLabel`: String ("Full year", "Term", "Half course", etc.)
- `grades`: Array of numbers (e.g., `[9, 10, 11, 12]`)
- `prerequisiteText`: String (from `prerequisite[0]`)
- `permissionRequired`: Boolean (from `prerequisite[1]`)

## Development Conventions
- **Directory Structure:**
  - `src/app`: Routes and pages.
  - `src/components`: Reusable UI components (currently sparse, check `sandbox`).
  - `src/lib`: Utility logic (`courseUtils.ts`, `plannerStore.ts`).
  - `src/types`: TypeScript definitions.
- **Routing:** Use Next.js `Link` for internal navigation. Avoid full page reloads.
- **State:** The planner state is shared between the Browser and Planner pages via `localStorage`.
- **Data Fetching:** Use `fetchCatalog()` from `src/lib/courseUtils.ts` to load course data. It handles multiple potential JSON paths.

## Key Files
- `loomis-course-app/src/lib/courseUtils.ts`: Core logic for fetching, flattening, and normalizing course data.
- `loomis-course-app/src/lib/plannerStore.ts`: Logic for managing the user's selected courses and plan (check for implementation details).
- `prep_data/json/catalogdbfinal.json`: The source of truth for course data.
