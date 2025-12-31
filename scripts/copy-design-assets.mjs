#!/usr/bin/env node
/**
 * copy-design-assets.mjs
 * 
 * Asset standardization script for design_ideas migration.
 * Copies local assets (images, fonts, media) from design_ideas packages
 * to the loomis-course-app public directory for sandbox mounting.
 * 
 * Usage:
 *   node scripts/copy-design-assets.mjs           # Copy all design assets
 *   node scripts/copy-design-assets.mjs --design current   # Copy specific design
 *   node scripts/copy-design-assets.mjs --dry-run          # Preview without copying
 *   node scripts/copy-design-assets.mjs --clean            # Remove existing assets first
 * 
 * @author Phase 1 Migration
 * @since 2025-12-31
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    designIdeasRoot: path.join(__dirname, '..', 'design_ideas'),
    publicRoot: path.join(__dirname, '..', 'loomis-course-app', 'public', 'design-ideas'),

    // Asset extensions to copy
    imageExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'],
    fontExtensions: ['.woff', '.woff2', '.ttf', '.otf', '.eot'],
    mediaExtensions: ['.mp4', '.webm', '.mp3', '.ogg', '.wav'],

    // Directories to scan within each design idea
    assetDirectories: ['public', 'assets', 'images', 'fonts', 'media', 'src/assets'],

    // Design categories to process
    categories: ['browser', 'sandbox'],
};

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    return {
        designFilter: args.includes('--design') ? args[args.indexOf('--design') + 1] : null,
        dryRun: args.includes('--dry-run'),
        clean: args.includes('--clean'),
        verbose: args.includes('--verbose') || args.includes('-v'),
        help: args.includes('--help') || args.includes('-h'),
    };
}

// Print help message
function printHelp() {
    console.log(`
Asset Standardization Script for Design Ideas Migration

Usage:
  node scripts/copy-design-assets.mjs [options]

Options:
  --design <name>   Only process specific design idea (e.g., 'current', 'my_list_sidebar')
  --dry-run         Preview what would be copied without actually copying
  --clean           Remove existing assets in target directory before copying
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Examples:
  node scripts/copy-design-assets.mjs
  node scripts/copy-design-assets.mjs --design current --verbose
  node scripts/copy-design-assets.mjs --dry-run
`);
}

// Get all asset extensions
function getAllAssetExtensions() {
    return [
        ...CONFIG.imageExtensions,
        ...CONFIG.fontExtensions,
        ...CONFIG.mediaExtensions,
    ];
}

// Check if a file is an asset
function isAssetFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return getAllAssetExtensions().includes(ext);
}

// Recursively find all asset files in a directory
async function findAssets(dir, basePath = dir) {
    const assets = [];

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            // Skip node_modules, .git, and other common non-asset directories
            if (entry.isDirectory()) {
                if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
                    const subAssets = await findAssets(fullPath, basePath);
                    assets.push(...subAssets);
                }
            } else if (entry.isFile() && isAssetFile(entry.name)) {
                assets.push({
                    absolutePath: fullPath,
                    relativePath: path.relative(basePath, fullPath),
                    filename: entry.name,
                    extension: path.extname(entry.name).toLowerCase(),
                });
            }
        }
    } catch (error) {
        // Directory might not exist or be inaccessible
        if (error.code !== 'ENOENT') {
            console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
        }
    }

    return assets;
}

// Get all design ideas in a category
async function getDesignIdeas(category) {
    const categoryPath = path.join(CONFIG.designIdeasRoot, category);
    const designs = [];

    try {
        const entries = await fs.readdir(categoryPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                designs.push({
                    name: entry.name,
                    category,
                    path: path.join(categoryPath, entry.name),
                });
            }
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn(`Warning: Could not read category ${category}: ${error.message}`);
        }
    }

    return designs;
}

// Copy a single asset
async function copyAsset(asset, targetDir, options) {
    const targetPath = path.join(targetDir, asset.relativePath);
    const targetDirPath = path.dirname(targetPath);

    if (options.dryRun) {
        console.log(`  [DRY-RUN] Would copy: ${asset.relativePath}`);
        return true;
    }

    try {
        await fs.mkdir(targetDirPath, { recursive: true });
        await fs.copyFile(asset.absolutePath, targetPath);
        if (options.verbose) {
            console.log(`  Copied: ${asset.relativePath}`);
        }
        return true;
    } catch (error) {
        console.error(`  Error copying ${asset.relativePath}: ${error.message}`);
        return false;
    }
}

// Process a single design idea
async function processDesign(design, options) {
    const assets = await findAssets(design.path);
    const targetDir = path.join(CONFIG.publicRoot, design.category, design.name);

    console.log(`\n📦 ${design.category}/${design.name}`);

    if (assets.length === 0) {
        console.log('   No assets found');
        return { design: design.name, copied: 0, skipped: 0, errors: 0 };
    }

    console.log(`   Found ${assets.length} asset(s)`);

    let copied = 0;
    let errors = 0;

    for (const asset of assets) {
        const success = await copyAsset(asset, targetDir, options);
        if (success) {
            copied++;
        } else {
            errors++;
        }
    }

    return { design: design.name, copied, skipped: 0, errors };
}

// Clean existing assets directory
async function cleanAssets(options) {
    if (!existsSync(CONFIG.publicRoot)) {
        return;
    }

    if (options.dryRun) {
        console.log(`[DRY-RUN] Would remove: ${CONFIG.publicRoot}`);
        return;
    }

    try {
        await fs.rm(CONFIG.publicRoot, { recursive: true, force: true });
        console.log(`🧹 Cleaned: ${CONFIG.publicRoot}`);
    } catch (error) {
        console.error(`Error cleaning assets: ${error.message}`);
    }
}

// Main function
async function main() {
    const options = parseArgs();

    if (options.help) {
        printHelp();
        process.exit(0);
    }

    console.log('🎨 Design Ideas Asset Standardization');
    console.log('=====================================');

    if (options.dryRun) {
        console.log('🔍 DRY-RUN MODE - No files will be copied\n');
    }

    // Verify design_ideas directory exists
    if (!existsSync(CONFIG.designIdeasRoot)) {
        console.error(`Error: design_ideas directory not found at ${CONFIG.designIdeasRoot}`);
        process.exit(1);
    }

    // Clean if requested
    if (options.clean) {
        await cleanAssets(options);
    }

    // Ensure public directory exists
    if (!options.dryRun) {
        await fs.mkdir(CONFIG.publicRoot, { recursive: true });
    }

    // Get all design ideas
    let allDesigns = [];
    for (const category of CONFIG.categories) {
        const designs = await getDesignIdeas(category);
        allDesigns.push(...designs);
    }

    // Filter if specific design requested
    if (options.designFilter) {
        allDesigns = allDesigns.filter(d => d.name === options.designFilter);
        if (allDesigns.length === 0) {
            console.error(`Error: Design '${options.designFilter}' not found`);
            process.exit(1);
        }
    }

    console.log(`Found ${allDesigns.length} design idea(s) to process`);

    // Process each design
    const results = [];
    for (const design of allDesigns) {
        const result = await processDesign(design, options);
        results.push(result);
    }

    // Print summary
    console.log('\n=====================================');
    console.log('📊 Summary');
    console.log('=====================================');

    const totalCopied = results.reduce((sum, r) => sum + r.copied, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

    console.log(`Total assets copied: ${totalCopied}`);
    if (totalErrors > 0) {
        console.log(`Errors: ${totalErrors}`);
    }

    if (totalCopied === 0 && totalErrors === 0) {
        console.log('\n✅ No local assets found in design ideas.');
        console.log('   This is expected if designs only use inline SVGs or external URLs.');
        console.log('   The script will work when local assets are added later.');
    } else if (totalErrors === 0) {
        console.log('\n✅ Asset standardization complete!');
    } else {
        console.log('\n⚠️ Asset standardization completed with errors.');
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
