#!/usr/bin/env node
/**
 * Sandbox Sync CLI
 *
 * Interactive tool to register design_ideas/ items into the sandbox.
 * Scans for TSX, HTML, images, and standalone apps, then generates
 * appropriate wrapper pages in the sandbox routes.
 */

import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const APP_ROOT = path.resolve(__dirname, '..');
const DESIGN_IDEAS_ROOT = path.resolve(APP_ROOT, '..', 'design_ideas');
const SANDBOX_ROOT = path.join(APP_ROOT, 'src', 'app', 'sandbox');
const MANIFEST_PATH = path.join(APP_ROOT, '.sandbox-sync-manifest.json');

// Source types
const SOURCE_TYPES = {
  TSX: 'tsx',
  HTML: 'html',
  IMAGE: 'image',
  STANDALONE: 'standalone',
};

// File extensions for each type
const TSX_EXTENSIONS = ['.tsx', '.jsx'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`→ ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

/**
 * Load existing manifest or create empty one
 */
async function loadManifest() {
  try {
    const data = await fs.readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {
      version: 1,
      lastSync: null,
      entries: [],
    };
  }
}

/**
 * Save manifest to disk
 */
async function saveManifest(manifest) {
  manifest.lastSync = new Date().toISOString();
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

/**
 * Check if a directory exists
 */
async function dirExists(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

/**
 * Recursively scan design_ideas for syncable items
 */
async function scanDesignIdeas() {
  const items = [];

  async function scanDir(dirPath, category = '') {
    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch (error) {
      logWarning(`Cannot read directory: ${dirPath}`);
      return;
    }

    for (const entry of entries) {
      // Skip hidden files and common non-source directories
      if (entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === 'build') {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(DESIGN_IDEAS_ROOT, fullPath);

      if (entry.isDirectory()) {
        // Check if it's a standalone app (has package.json)
        const hasPackageJson = await fileExists(path.join(fullPath, 'package.json'));
        // Check if it's a static HTML folder (has index.html but no package.json)
        const hasIndexHtml = await fileExists(path.join(fullPath, 'index.html'));

        if (hasPackageJson) {
          // It's a standalone app
          items.push({
            name: entry.name,
            path: relativePath,
            fullPath,
            sourceType: SOURCE_TYPES.STANDALONE,
            category: category || path.dirname(relativePath),
          });
          // Don't scan inside standalone apps
        } else if (hasIndexHtml) {
          // It's a static HTML folder
          items.push({
            name: entry.name,
            path: relativePath,
            fullPath,
            sourceType: SOURCE_TYPES.HTML,
            category: category || path.dirname(relativePath),
          });
          // Don't scan inside HTML folders
        } else {
          // Regular directory, scan recursively
          await scanDir(fullPath, category || entry.name);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const baseName = path.basename(entry.name, ext);

        if (TSX_EXTENSIONS.includes(ext)) {
          items.push({
            name: baseName,
            path: relativePath,
            fullPath,
            sourceType: SOURCE_TYPES.TSX,
            category: category || path.dirname(relativePath),
          });
        } else if (IMAGE_EXTENSIONS.includes(ext)) {
          items.push({
            name: baseName,
            path: relativePath,
            fullPath,
            sourceType: SOURCE_TYPES.IMAGE,
            category: category || path.dirname(relativePath),
          });
        }
      }
    }
  }

  await scanDir(DESIGN_IDEAS_ROOT);
  return items;
}

/**
 * Generate a URL-safe slug from a string
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate wrapper page for TSX source
 */
function generateTsxWrapper(item) {
  const componentName = item.name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^./, (c) => c.toUpperCase());

  return `/**
 * Sandbox wrapper for TSX component
 * Source: design_ideas/${item.path}
 *
 * This is a placeholder page. To integrate the actual component:
 * 1. Copy the component from the source path above
 * 2. Adapt imports for the Next.js app structure
 * 3. Replace the placeholder below with the actual component
 */

export default function ${componentName}Page() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">${item.name}</h1>
        <p className="text-gray-600">
          Source: <code className="bg-gray-100 px-2 py-1 rounded">design_ideas/${item.path}</code>
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">TSX Component Placeholder</p>
        <p className="text-sm text-gray-400">
          Import and render the component from the source path above
        </p>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate wrapper page for HTML folder
 */
function generateHtmlWrapper(item) {
  const staticPath = `/sandbox-static/${item.path}/index.html`;
  const componentName = item.name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^./, (c) => c.toUpperCase());

  return `/**
 * Sandbox wrapper for static HTML
 * Source: design_ideas/${item.path}
 *
 * This page embeds the static HTML in an iframe.
 * The HTML files should be copied to public/sandbox-static/
 */

export default function ${componentName}Page() {
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-gray-100 border-b">
        <h1 className="text-lg font-semibold">${item.name}</h1>
        <p className="text-sm text-gray-600">
          Source: <code className="bg-white px-2 py-0.5 rounded">design_ideas/${item.path}</code>
        </p>
      </div>

      <iframe
        src="${staticPath}"
        className="flex-1 w-full border-0"
        title="${item.name}"
      />
    </div>
  );
}
`;
}

/**
 * Generate wrapper page for image
 */
function generateImageWrapper(item) {
  const ext = path.extname(item.path);
  const staticPath = `/sandbox-static/${item.path}`;
  const componentName = item.name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^./, (c) => c.toUpperCase());

  return `/**
 * Sandbox wrapper for image asset
 * Source: design_ideas/${item.path}
 *
 * The image should be copied to public/sandbox-static/
 */

import Image from 'next/image';

export default function ${componentName}Page() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">${item.name}</h1>
        <p className="text-gray-600">
          Source: <code className="bg-gray-100 px-2 py-1 rounded">design_ideas/${item.path}</code>
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="${staticPath}"
          alt="${item.name}"
          className="max-w-full h-auto"
        />
      </div>
    </div>
  );
}
`;
}

/**
 * Generate wrapper page for standalone app
 */
function generateStandaloneWrapper(item) {
  const componentName = item.name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^./, (c) => c.toUpperCase());

  return `/**
 * Sandbox reference for standalone app
 * Source: design_ideas/${item.path}
 *
 * This is a standalone application with its own package.json.
 * Run it separately using the instructions below.
 */

export default function ${componentName}Page() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">${item.name}</h1>
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
          Standalone App
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="font-semibold mb-3">Source Location</h2>
        <code className="block bg-gray-100 px-3 py-2 rounded text-sm">
          design_ideas/${item.path}
        </code>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="font-semibold mb-3">Run Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            Navigate to the app directory:
            <code className="block bg-gray-100 px-3 py-2 rounded mt-1 ml-5">
              cd design_ideas/${item.path}
            </code>
          </li>
          <li>
            Install dependencies:
            <code className="block bg-gray-100 px-3 py-2 rounded mt-1 ml-5">
              npm install
            </code>
          </li>
          <li>
            Start the development server:
            <code className="block bg-gray-100 px-3 py-2 rounded mt-1 ml-5">
              npm run dev
            </code>
          </li>
        </ol>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate wrapper based on source type
 */
function generateWrapper(item) {
  switch (item.sourceType) {
    case SOURCE_TYPES.TSX:
      return generateTsxWrapper(item);
    case SOURCE_TYPES.HTML:
      return generateHtmlWrapper(item);
    case SOURCE_TYPES.IMAGE:
      return generateImageWrapper(item);
    case SOURCE_TYPES.STANDALONE:
      return generateStandaloneWrapper(item);
    default:
      throw new Error(`Unknown source type: ${item.sourceType}`);
  }
}

/**
 * Sync a single item to the sandbox
 */
async function syncItem(item, manifest) {
  const categorySlug = slugify(item.category || 'misc');
  const itemSlug = slugify(item.name);
  const routePath = path.join(SANDBOX_ROOT, categorySlug, itemSlug);
  const pagePath = path.join(routePath, 'page.tsx');

  // Create directory
  await fs.mkdir(routePath, { recursive: true });

  // Generate and write wrapper
  const wrapper = generateWrapper(item);
  await fs.writeFile(pagePath, wrapper);

  // Create manifest entry
  const entry = {
    id: `${categorySlug}-${itemSlug}`,
    sourceType: item.sourceType,
    sourcePath: item.path,
    sandboxRoute: `/sandbox/${categorySlug}/${itemSlug}`,
    generatedFiles: [path.relative(APP_ROOT, pagePath)],
    syncedAt: new Date().toISOString(),
  };

  // Update or add entry in manifest
  const existingIndex = manifest.entries.findIndex((e) => e.id === entry.id);
  if (existingIndex >= 0) {
    manifest.entries[existingIndex] = entry;
  } else {
    manifest.entries.push(entry);
  }

  return entry;
}

/**
 * Display item for selection menu
 */
function formatItemDisplay(item, index, isSelected) {
  const typeColors = {
    [SOURCE_TYPES.TSX]: 'magenta',
    [SOURCE_TYPES.HTML]: 'cyan',
    [SOURCE_TYPES.IMAGE]: 'yellow',
    [SOURCE_TYPES.STANDALONE]: 'blue',
  };

  const typeLabels = {
    [SOURCE_TYPES.TSX]: 'TSX',
    [SOURCE_TYPES.HTML]: 'HTML',
    [SOURCE_TYPES.IMAGE]: 'IMG',
    [SOURCE_TYPES.STANDALONE]: 'APP',
  };

  const checkbox = isSelected ? '[x]' : '[ ]';
  const color = typeColors[item.sourceType] || 'reset';
  const label = typeLabels[item.sourceType] || '???';

  return `${colors.dim}${String(index + 1).padStart(2)}.${colors.reset} ${checkbox} ${colors[color]}[${label}]${colors.reset} ${item.name} ${colors.dim}(${item.path})${colors.reset}`;
}

/**
 * Interactive selection menu
 */
async function interactiveSelect(items, rl) {
  const selected = new Set();

  console.log('\n' + colors.bright + 'Syncable Items Found:' + colors.reset);
  console.log(colors.dim + '─'.repeat(60) + colors.reset);

  items.forEach((item, index) => {
    console.log(formatItemDisplay(item, index, false));
  });

  console.log(colors.dim + '─'.repeat(60) + colors.reset);
  console.log('\nCommands:');
  console.log('  Enter numbers (comma-separated) to toggle selection');
  console.log('  "all" to select all');
  console.log('  "none" to deselect all');
  console.log('  "done" to proceed with sync');
  console.log('  "quit" to exit without syncing\n');

  while (true) {
    const input = await rl.question(`${colors.cyan}Selection [${selected.size} selected]:${colors.reset} `);
    const cmd = input.trim().toLowerCase();

    if (cmd === 'quit' || cmd === 'q') {
      return null;
    }

    if (cmd === 'done' || cmd === 'd') {
      return Array.from(selected).map((i) => items[i]);
    }

    if (cmd === 'all' || cmd === 'a') {
      items.forEach((_, i) => selected.add(i));
      console.log(colors.green + `Selected all ${items.length} items` + colors.reset);
      continue;
    }

    if (cmd === 'none' || cmd === 'n') {
      selected.clear();
      console.log(colors.yellow + 'Cleared selection' + colors.reset);
      continue;
    }

    // Parse comma-separated numbers
    const nums = cmd.split(',').map((s) => parseInt(s.trim(), 10) - 1);
    for (const num of nums) {
      if (num >= 0 && num < items.length) {
        if (selected.has(num)) {
          selected.delete(num);
          console.log(colors.dim + `Deselected: ${items[num].name}` + colors.reset);
        } else {
          selected.add(num);
          console.log(colors.green + `Selected: ${items[num].name}` + colors.reset);
        }
      } else if (!isNaN(num)) {
        console.log(colors.red + `Invalid number: ${num + 1}` + colors.reset);
      }
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n' + colors.bright + '=== Sandbox Sync CLI ===' + colors.reset);
  console.log(colors.dim + 'Register design_ideas into the sandbox\n' + colors.reset);

  // Check if design_ideas exists
  if (!(await dirExists(DESIGN_IDEAS_ROOT))) {
    logError(`design_ideas directory not found at: ${DESIGN_IDEAS_ROOT}`);
    logInfo('Create the directory and add some design files to sync.');
    process.exit(1);
  }

  // Scan for items
  logInfo('Scanning design_ideas for syncable items...');
  const items = await scanDesignIdeas();

  if (items.length === 0) {
    logWarning('No syncable items found in design_ideas/');
    logInfo('Supported types: TSX/JSX files, HTML folders, images, standalone apps');
    process.exit(0);
  }

  logSuccess(`Found ${items.length} syncable item(s)`);

  // Load manifest
  const manifest = await loadManifest();

  // Create readline interface
  const rl = createInterface({ input, output });

  try {
    // Interactive selection
    const selectedItems = await interactiveSelect(items, rl);

    if (selectedItems === null) {
      logWarning('Sync cancelled');
      process.exit(0);
    }

    if (selectedItems.length === 0) {
      logWarning('No items selected');
      process.exit(0);
    }

    console.log('\n' + colors.bright + 'Syncing...' + colors.reset);

    // Sync selected items
    for (const item of selectedItems) {
      try {
        const entry = await syncItem(item, manifest);
        logSuccess(`Synced: ${item.name} -> ${entry.sandboxRoute}`);
      } catch (error) {
        logError(`Failed to sync ${item.name}: ${error.message}`);
      }
    }

    // Save manifest
    await saveManifest(manifest);
    logSuccess(`Manifest updated: ${path.relative(process.cwd(), MANIFEST_PATH)}`);

    console.log('\n' + colors.bright + 'Sync Complete!' + colors.reset);
    console.log(colors.dim + `Synced ${selectedItems.length} item(s)` + colors.reset + '\n');

  } finally {
    rl.close();
  }
}

// Run
main().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
