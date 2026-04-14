import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { login } from '../auth/login.js';
import { loadSession, loadOrRefreshSession, clearSession, isSessionValid } from '../auth/session.js';
import { ok, fail, warn, whatNext } from '../ui/theme.js';

export function loginCommand(program: Command) {
  program
    .command('login')
    .description('Authenticate with UPC Aula Virtual via Microsoft SSO')
    .option('--headless', 'Run browser in headless mode (no window)')
    .option('-u, --username <email>', 'UPC email (optional, can type in browser)')
    .option('-p, --password <password>', 'Password (optional, can type in browser)')
    .action(async (opts) => {
      // Check if already logged in
      const existing = loadSession();
      if (isSessionValid(existing)) {
        console.log(chalk.yellow(`Already logged in as ${chalk.bold(existing!.userName || 'unknown')}`));
        const { relogin } = await inquirer.prompt([
          { type: 'confirm', name: 'relogin', message: 'Re-authenticate?', default: false },
        ]);
        if (!relogin) return;
      }

      console.log(chalk.cyan('\nOpening browser for Microsoft login...'));
      console.log(chalk.gray('A browser window will open. Complete the login and it will close automatically.\n'));

      try {
        const session = await login({
          headless: opts.headless ?? false,
          username: opts.username,
          password: opts.password,
        });

        const remainingMin = Math.round((session.expiresAt - Date.now()) / 60_000);
        const remainingHr  = (remainingMin / 60).toFixed(1);
        console.log(ok(`Sesión guardada — expira en ${remainingHr}h`));
        if (session.userName) console.log(chalk.gray(`  Usuario: ${session.userName}`));
        if (session.userId)   console.log(chalk.gray(`  ID:      ${session.userId}`));
        whatNext();
      } catch (err: any) {
        console.error(chalk.red(`\n✗ Login failed: ${err.message}`));
        process.exit(1);
      }
    });

  program
    .command('logout')
    .description('Clear the saved session')
    .action(() => {
      clearSession();
      console.log(chalk.green('✓ Session cleared'));
    });

  program
    .command('whoami')
    .description('Show current logged-in user')
    .action(async () => {
      const session = await loadOrRefreshSession();
      if (!isSessionValid(session)) {
        console.log(chalk.red('Not logged in. Run: blackboard login'));
        process.exit(1);
      }
      console.log(chalk.green(`Logged in as: ${chalk.bold(session!.userName || session!.userId || 'unknown')}`));
      const remaining = Math.round((session!.expiresAt - Date.now()) / 60_000);
      console.log(chalk.gray(`Session expires in: ${remaining} minutes`));
    });
}
