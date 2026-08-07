import type { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { loginWithCampusAccount } from './login.js';
import { getValidAccountSession } from './session.js';
import { clearAccountSession, loadAccountSession, saveAccountSession } from './store.js';
import { ok, fail, hint } from '../ui/theme.js';
import { runBlackboardLogin } from '../providers/blackboard/commands/login.js';

export function accountCommand(program: Command) {
  const account = program
    .command('account')
    .description('Cuenta Campus (Google) — identidad compartida entre las apps de Campus, separada de tu sesión de Blackboard');

  account
    .command('login')
    .description('Inicia sesión con tu cuenta Campus (Google) en el navegador')
    .action(async () => {
      console.log(chalk.cyan('\nAbriendo el navegador para iniciar sesión con Google...\n'));
      try {
        const session = await loginWithCampusAccount();
        saveAccountSession(session);
        console.log(ok(`Sesión iniciada como ${chalk.bold(session.account.name)} (${session.account.email})`));
        // El registro es el momento de decirlo: es cuando el usuario nos da
        // una cuenta y cuando esa cuenta pasa a identificar sus métricas de
        // uso. Enterrarlo solo en el README no cuenta como avisar.
        console.log(chalk.gray('\n  Campus registra qué comandos y herramientas usas para mejorar el producto.'));
        console.log(chalk.gray('  Nunca tus cursos, tareas ni calificaciones. Para desactivarlo: POSTHOG_DISABLED=1'));
      } catch (err: any) {
        console.error(fail(`No se pudo iniciar sesión: ${err.message}`));
        process.exit(1);
      }

      // Once the shared Campus identity is set up, continue straight into
      // the (unchanged, fully local) Blackboard SSO flow.
      await runBlackboardLogin();
    });

  account
    .command('whoami')
    .description('Muestra la cuenta Campus activa')
    .action(async () => {
      const stored = loadAccountSession();
      if (!stored) {
        console.log(fail('No hay sesión de cuenta Campus.'));
        console.log(`Ejecuta: ${hint('campus account login')}`);
        return;
      }
      const spinner = ora('Verificando sesión...').start();
      const session = await getValidAccountSession();
      if (!session) {
        spinner.fail('Sesión expirada o revocada.');
        console.log(`Ejecuta: ${hint('campus account login')}`);
        process.exit(1);
      }
      spinner.stop();
      console.log(ok(`${chalk.bold(session.account.name)} (${session.account.email})`));
      if (session.account.universityId) console.log(chalk.gray(`  Universidad: ${session.account.universityId}`));
    });

  account
    .command('logout')
    .description('Cierra la sesión de la cuenta Campus en este equipo')
    .action(() => {
      clearAccountSession();
      console.log(ok('Sesión de cuenta Campus cerrada.'));
    });
}
