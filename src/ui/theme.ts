import chalk from 'chalk';

// UPC brand red
export const upcRed = chalk.hex('#E31837');
export const upcRedBold = chalk.hex('#E31837').bold;
export const dim = chalk.dim;

export const ok    = (s: string) => chalk.green(`✓ ${s}`);
export const fail  = (s: string) => chalk.red(`✗ ${s}`);
export const warn  = (s: string) => chalk.yellow(`⚠ ${s}`);
export const hint  = (s: string) => chalk.cyan(s);
export const bold  = (s: string) => chalk.bold(s);
export const gray  = (s: string) => chalk.gray(s);

export const BANNER = `
${upcRed('  ██████  ██       █████   ██████ ██   ██ ██████   ██████   █████  ██████  ██████  ')}
${upcRed('  ██   ██ ██      ██   ██ ██      ██  ██  ██   ██ ██    ██ ██   ██ ██   ██ ██   ██ ')}
${upcRed('  ██████  ██      ███████ ██      █████   ██████  ██    ██ ███████ ██████  ██   ██ ')}
${upcRed('  ██   ██ ██      ██   ██ ██      ██  ██  ██   ██ ██    ██ ██   ██ ██   ██ ██   ██ ')}
${upcRed('  ██████  ███████ ██   ██  ██████ ██   ██ ██████   ██████  ██   ██ ██   ██ ██████  ')}
  ${chalk.dim('CLI no oficial para UPC Aula Virtual · Blackboard Learn')}
`;

export function whatNext() {
  console.log(`
  ${chalk.bold('¿Qué puedo hacer ahora?')}

  ${hint('blackboard courses list')}               ver tus cursos del ciclo
  ${hint('blackboard assignments list <courseId>')} ver tareas pendientes y notas
  ${hint('blackboard courses contents <courseId>')} explorar materiales de un curso
  ${hint('blackboard download-folder <id> <fid>')} descargar toda una carpeta
  ${hint('blackboard status')}                     estado de sesión y servidor
`);
}
