#!/usr/bin/env node

/**
 * Clean dev script - starts all workspace dev servers and prints a summary
 */

import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// App configurations with fixed ports
const apps = [
    { name: 'browser-lovable', filter: 'vite_react_shadcn_ts', port: 8080 },
    { name: 'catalog-explorer', filter: 'loomis-chaffee-catalog-explorer', port: 3001 },
    { name: 'academic-catalog', filter: 'academic-catalog-browser', port: 3002 },
    { name: 'sandbox-landing', filter: 'sandbox-vision', port: 3003 },
];

const children = [];
const readyApps = new Map();

function printBox() {
    const maxNameLen = Math.max(...apps.map(a => a.name.length));
    const width = 55;

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
        console.log('│' + line + ' '.repeat(width - visibleLen) + '│');
    }

    console.log('╰' + '─'.repeat(width) + '╯');
    console.log('\n\x1b[90mPress Ctrl+C to stop all servers\x1b[0m\n');
}

function startApp(app) {
    const proc = spawn('pnpm', ['--filter', app.filter, 'dev', '--port', String(app.port)], {
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
console.log('\x1b[90mStarting 4 dev servers...\x1b[0m');
for (const app of apps) {
    startApp(app);
}

// Fallback: print box after timeout even if some apps didn't report
setTimeout(() => {
    if (readyApps.size < apps.length) {
        printBox();
    }
}, 5000);
