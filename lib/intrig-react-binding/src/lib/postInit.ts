import { exec } from 'child_process';
import * as util from 'util';
import { detectPackageManager } from 'nypm';
import cli from 'cli-ux';

const execPromise = util.promisify(exec);

export async function postInit() {
  try {
    cli.action.start('Installing @intrig/react dependency...');

    const packageManager = await detectPackageManager(process.cwd());
    let installCommand = '';

    switch (packageManager.name) {
      case 'npm':
        installCommand = 'npm install @intrig/react';
        break;
      case 'yarn':
        installCommand = 'yarn add @intrig/react';
        break;
      case 'pnpm':
        installCommand = 'pnpm add @intrig/react';
        break;
      case 'bun':
        installCommand = 'bun add @intrig/react';
        break;
      default:
        throw new Error(`Unsupported package manager: ${packageManager.name}`);
    }

    await execPromise(installCommand);
    cli.action.stop('@intrig/react has been installed successfully.');
  } catch (error) {
    cli.action.stop('Failed to install @intrig/react.');
    console.error(error);
  }
}
