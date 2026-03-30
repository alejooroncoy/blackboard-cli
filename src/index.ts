#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { loginCommand } from './commands/login.js';
import { coursesCommand } from './commands/courses.js';
import { apiDocsCommand } from './commands/api-docs.js';
import { downloadCommand } from './commands/download.js';
import { assignmentsCommand } from './commands/assignments.js';
import { loadSession, isSessionValid } from './auth/session.js';
import { createClient } from './api/client.js';
import { getMe, getSystemVersion } from './api/courses.js';
import { BANNER, ok, fail, hint } from './ui/theme.js';

const program = new Command();

program
  .name('blackboard')
  .description('CLI no oficial para UPC Aula Virtual (Blackboard Learn)')
  .version('1.0.0')
  .addHelpText('beforeAll', BANNER);

// Auth commands
loginCommand(program);

// Course commands
coursesCommand(program);

// Status / ping
program
  .command('status')
  .description('Estado de sesión y versión del servidor')
  .option('--json', 'Output raw JSON')
  .action(async (opts) => {
    const session = loadSession();
    const valid = isSessionValid(session);

    const sysVersion = await getSystemVersion(
      createClient(session ?? { cookies: [], xsrfToken: '', expiresAt: 0 })
    ).catch(() => null);

    const result = {
      loggedIn: valid,
      user: valid ? { id: session!.userId, name: session!.userName } : null,
      sessionExpiresAt: valid ? new Date(session!.expiresAt).toISOString() : null,
      server: sysVersion?.learn ?? null,
    };

    if (opts.json) { console.log(JSON.stringify(result, null, 2)); return; }

    const v = sysVersion?.learn;
    console.log(`\n  Servidor: ${chalk.cyan(`Blackboard Learn ${v?.major}.${v?.minor}.${v?.patch} (${v?.build})`)}`);
    if (valid) {
      const remaining = Math.round((session!.expiresAt - Date.now()) / 60_000);
      console.log(`  Sesión:   ${ok(`autenticado como ${chalk.bold(session!.userName || session!.userId || 'unknown')}`)}`);
      console.log(`            ${chalk.gray(`expira en ${remaining} min`)}`);
    } else {
      console.log(`  Sesión:   ${fail('no autenticado')} — ejecuta: ${hint('blackboard login')}`);
    }
    console.log('');
  });

// Endpoint docs
apiDocsCommand(program);

// Download commands
downloadCommand(program);

// Assignment commands
assignmentsCommand(program);

// API passthrough para LLMs / power users
program
  .command('api <method> <path>')
  .description('Llamada directa a la REST API (útil para LLMs y scripts)')
  .option('-b, --body <json>', 'Cuerpo JSON para POST/PUT')
  .option('-q, --query <params>', 'Query params (ej: "limit=10&offset=0")')
  .action(async (method: string, apiPath: string, opts) => {
    const session = loadSession();
    if (!isSessionValid(session)) {
      console.error(JSON.stringify({ error: 'Not authenticated. Run: blackboard login' }));
      process.exit(1);
    }

    const client = createClient(session!);
    const params = opts.query ? Object.fromEntries(new URLSearchParams(opts.query)) : undefined;
    const data = opts.body ? JSON.parse(opts.body) : undefined;

    try {
      const r = await client.request({ method: method.toLowerCase() as any, url: apiPath, params, data });
      console.log(JSON.stringify(r.data, null, 2));
    } catch (err: any) {
      console.error(JSON.stringify({ error: err.message, status: err.response?.status, body: err.response?.data }, null, 2));
      process.exit(1);
    }
  });

// MCP server mode
program
  .command('mcp')
  .description('Inicia el servidor MCP para usar con Claude (stdio)')
  .action(async () => {
    const { startMcpServer } = await import('./mcp/server.js');
    await startMcpServer();
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
