import { exec } from 'child_process';
import * as util from 'util';
import { detectPackageManager } from 'nypm';
import cli from 'cli-ux';

const execPromise = util.promisify(exec);

export async function postInit() {
  const packageManager = await detectPackageManager(process.cwd());
  let clientInstallCommand = '';
  let cliInstallCommand = '';

  switch (packageManager.name) {
    case 'npm':
      clientInstallCommand = 'npm install @intrig/react';
      cliInstallCommand = 'npm install -D intrig';
      break;
    case 'yarn':
      clientInstallCommand = 'yarn add @intrig/react';
      cliInstallCommand = 'yarn add -D intrig';
      break;
    case 'pnpm':
      clientInstallCommand = 'pnpm add @intrig/react';
      cliInstallCommand = 'pnpm add -D intrig';
      break;
    case 'bun':
      clientInstallCommand = 'bun add @intrig/react';
      cliInstallCommand = 'bun add -D intrig';
      break;
    default:
      throw new Error(`Unsupported package manager: ${packageManager.name}`);
  }

  try {
    cli.action.start('Installing @intrig/react dependency...');
    await execPromise(clientInstallCommand);
    cli.action.stop('@intrig/react has been installed successfully.');
  } catch (error) {
    cli.action.stop('Failed to install @intrig/react.');
    console.error(error);
  }

  try {
    cli.action.start('Installing intrig dev dependency...');
    await execPromise(cliInstallCommand);
  } catch (error) {
    cli.action.stop('Failed to install intrig dev dependency.');
    console.error(error);
  }
}
