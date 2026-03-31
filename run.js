#!/usr/bin/env node
// Run TypeScript directly without build step
const { spawnSync } = require('child_process');
const path = require('path');
const tsx = path.join(__dirname, 'node_modules', '.bin', 'tsx');
const entry = path.join(__dirname, 'src', 'index.ts');
const nodeDir = path.dirname(process.execPath);
const env = { ...process.env, PATH: `${nodeDir}${path.delimiter}${process.env.PATH}` };
const result = spawnSync(tsx, [entry, ...process.argv.slice(2)], { stdio: 'inherit', env });
process.exit(result.status ?? 0);
