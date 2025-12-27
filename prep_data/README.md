# Course Data Pipeline

Documentation for the course data extraction and processing pipeline.

## Overview

The course data flows from source PDFs through multiple transformations:

```
prep_data/
├── department_pdfs/    # Source PDFs from departments
├── md_conversions/     # Markdown extractions
├── json/               # JSON by department
└── prompts_for_ai/     # AI prompts for extraction
    ↓
loomis-course-app/
└── public/
    └── catalog.json    # Final merged catalog
```

## Source Data

### Directory Structure

```
prep_data/
├── department_pdfs/
│   ├── English.pdf
│   ├── History.pdf
│   ├── Mathematics.pdf
│   ├── Science.pdf
│   └── ... (10 departments)
├── md_conversions/
│   ├── English.md
│   ├── History.md
│   └── ...
├── json/
│   ├── English.json
│   ├── History.json
│   └── catalogdbfinal.json
└── prompts_for_ai/
    └── course_extraction.md
```

### Department List

| Department | Source File |
|------------|-------------|
| English | `English.pdf` |
| Modern or Classical Languages | `Languages.pdf` |
| History, Philosophy, Religious Studies & Social Science | `HPRSS.pdf` |
| Mathematics | `Mathematics.pdf` |
| Computer Science | `ComputerScience.pdf` |
| Science | `Science.pdf` |
| Performing Arts/Visual Arts | `PAVA.pdf` |

## Pipeline Steps

### Step 1: Extract Text from PDFs

Extract text from department PDFs to Markdown:

```bash
# Manual extraction using PDF tool
pdftotext English.pdf English.txt

# Or use AI-assisted extraction
python scripts/extract_from_pdf.py --input department_pdfs/English.pdf
```

Output: `md_conversions/English.md`

### Step 2: Convert to JSON

Process Markdown to structured JSON by department:

```bash
# Using the conversion script
python scripts/markdown_to_json.py --input md_conversions/English.md --output json/English.json
```

Output: `json/English.json` (per department)

### Step 3: Merge All Departments

Combine all department JSON files:

```bash
# Merge into final catalog
python scripts/merge_catalog.py --input json/*.json --output json/catalogdbfinal.json
```

Output: `json/catalogdbfinal.json`

### Step 4: Finalize for Application

Copy to application public directory:

```bash
cp json/catalogdbfinal.json ../loomis-course-app/public/catalog.json
```

## Data Schema

### Department JSON Format

```json
{
  "department": "English",
  "courses": [
    {
      "title": "English I",
      "description": "Introduction to literary analysis...",
      "rigor": 1,
      "gesc": false,
      "ppr": false,
      "term": "year course",
      "duration": "full-year",
      "grades": [9, 10, 11, 12],
      "offered_in_25": true
    }
  ]
}
```

### Course Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | string | Course title |
| `description` | string | Course description |
| `department` | string | Department name |
| `rigor` | number | 1=Standard, 2=Advanced, 3=CL |
| `gesc` | boolean | Global Education & Social Change |
| `ppr` | boolean | Philosophical, Political, or Religious |
| `term` | string | "year course" or "term course" |
| `duration` | string | "full-year", "term", "two terms", "half course" |
| `grades` | number[] | Available grades [9, 10, 11, 12] |
| `offered_in_25` | boolean | Offered in 2025-26 |

## Adding or Updating Courses

### Manual Update

1. Update source PDF in `department_pdfs/`
2. Extract text to `md_conversions/`
3. Update JSON in `json/department.json`
4. Run merge script
5. Verify in application

### Quick Fix (JSON Direct)

For minor corrections, edit `json/department.json` directly:

```json
{
  "department": "Mathematics",
  "courses": [
    {
      "title": "Calculus AB",
      "description": "Updated description...",
      "rigor": 2
    }
  ]
}
```

Then run the merge script.

## Quality Checks

After updating course data:

- [ ] All required fields present
- [ ] No duplicate course titles
- [ ] Grades are valid (9-12)
- [ ] Tags derived correctly (GESC, PPR, CL, ADV)
- [ ] Application loads without errors
- [ ] Search returns expected results

## Automation Scripts

Located in `prep_data/scripts/`:

| Script | Purpose |
|--------|---------|
| `extract_from_pdf.py` | Extract text from PDFs |
| `markdown_to_json.py` | Convert Markdown to JSON |
| `merge_catalog.py` | Merge department JSONs |
| `validate_catalog.py` | Validate final catalog |

### Usage

```bash
cd prep_data

# Extract all PDFs
python scripts/extract_from_pdf.py --all

# Convert to JSON
python scripts/markdown_to_json.py --all

# Merge
python scripts/merge_catalog.py

# Validate
python scripts/validate_catalog.py
```

## Related Documentation

- [Architecture](../docs/architecture.md) - System architecture
- [Course Types](../loomis-course-app/src/types/course.ts) - TypeScript definitions
- [Testing Guide](../docs/TESTING.md) - Testing the catalog
