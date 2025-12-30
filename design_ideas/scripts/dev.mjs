#!/usr/bin/env node

/**
 * Auto-detect dev script - dynamically discovers workspace packages
 * and starts all dev servers with assigned ports.
 */

import { spawn } from 'child_process';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const PORT_START = 3000;
const PORT_RANGE = 100;

/**
 * Find next available port, respecting preferred port if specified.
 */
function findAvailablePort(usedPorts, preferredPort = null) {
    if (preferredPort && !usedPorts.has(preferredPort)) {
        return preferredPort;
    }
    for (let i = 0; i < PORT_RANGE; i++) {
        const port = PORT_START + i;
        if (!usedPorts.has(port)) return port;
    }
    throw new Error('No available ports in range');
}

/**
 * Detect all workspace packages by scanning browser/* and sandbox/* directories.
 */
function detectApps() {
    const apps = [];
    const usedPorts = new Set();
    const baseDirs = ['browser', 'sandbox'];

    for (const baseDir of baseDirs) {
        const dirPath = join(rootDir, baseDir);
        if (!existsSync(dirPath)) continue;

        const entries = readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

            const appDir = join(dirPath, entry.name);
            const metadataPath = join(appDir, 'metadata.json');

            if (existsSync(metadataPath)) {
                try {
                    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
                    const port = findAvailablePort(usedPorts, metadata.port || null);

                    apps.push({
                        name: metadata.name || entry.name,
                        dir: entry.name,
                        baseDir,
                        port,
                        description: metadata.description || ''
                    });

                    usedPorts.add(port);
                } catch (err) {
                    console.error(`\x1b[33mWarning: Invalid metadata.json in ${baseDir}/${entry.name}\x1b[0m`);
                }
            }
        }
    }

    return apps.sort((a, b) => a.name.localeCompare(b.name));
}

const apps = detectApps();
const children = [];
const readyApps = new Map();

function printBox() {
    if (apps.length === 0) {
        console.log('\n\x1b[33mNo apps detected. Add folders with metadata.json to browser/ or sandbox/.\x1b[0m\n');
        return;
    }

    const maxNameLen = Math.max(...apps.map(a => a.name.length));
    const width = 60;

    console.log('\n');
    console.log('╭' + '─'.repeat(width) + '╮');
    console.log('│  \x1b[1m\x1b[36mDesign Ideas Dev Servers\x1b[0m' + ' '.repeat(width - 26) + '│');
    console.log('├' + '─'.repeat(width) + '┤');

    for (const app of apps) {
        const url = readyApps.get(app.name) || `http://localhost:${app.port}`;
        const padding = ' '.repeat(maxNameLen - app.name.length);
        const line = `  \x1b[33m${app.name}\x1b[0m${padding}  →  \x1b[32m${url}\x1b[0m`;
        // Calculate visible length (without ANSI codes)
        const visibleLen = `  ${app.name}${padding}  →  ${url}`.length;
        console.log('│' + line + ' '.repeat(Math.max(0, width - visibleLen)) + '│');
    }

    console.log('╰' + '─'.repeat(width) + '╯');
    console.log('\n\x1b[90mPress Ctrl+C to stop all servers\x1b[0m\n');
}

function startApp(app) {
    const filter = `./${app.baseDir}/${app.dir}`;
    const proc = spawn('pnpm', ['--filter', filter, 'dev', '--port', String(app.port)], {
        cwd: rootDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
    });

    children.push(proc);

    // Capture URL from output
    const handleOutput = (data) => {
        const text = data.toString();
        const match = text.match(/Local:\s+(http:\/\/localhost:\d+)/);
        if (match) {
            readyApps.set(app.name, match[1]);

            // Print summary when all apps are ready
            if (readyApps.size === apps.length) {
                printBox();
            }
        }
    };

    proc.stdout.on('data', handleOutput);
    proc.stderr.on('data', handleOutput);

    proc.on('error', (err) => {
        console.error(`\x1b[31mFailed to start ${app.name}:\x1b[0m`, err.message);
    });
}

function cleanup() {
    console.log('\n\x1b[90mStopping all servers...\x1b[0m');
    for (const child of children) {
        child.kill('SIGTERM');
    }
    process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start all apps
if (apps.length === 0) {
    console.log('\x1b[33mNo apps detected. Add folders with metadata.json to browser/ or sandbox/.\x1b[0m');
    process.exit(0);
}

console.log(`\x1b[90mStarting ${apps.length} dev server(s)...\x1b[0m`);
for (const app of apps) {
    startApp(app);
}

// Fallback: print box after timeout even if some apps didn't report
setTimeout(() => {
    if (readyApps.size < apps.length) {
        printBox();
    }
}, 5000);
