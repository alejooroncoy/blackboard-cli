#!/usr/bin/env node
// Run TypeScript directly without build step
const { spawnSync } = require('child_process');
const path = require('path');
const tsx = path.join(__dirname, 'node_modules', '.bin', 'tsx');
const entry = path.join(__dirname, 'src', 'index.ts');
const result = spawnSync(tsx, [entry, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 0);
