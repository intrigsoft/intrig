import { exec } from 'child_process';
import * as util from 'util';
import { detectPackageManager } from 'nypm';
import cli from 'cli-ux';
import path from 'path';
import fs from 'fs';

const execPromise = util.promisify(exec);

export async function postInit() {
  const packageManager = await detectPackageManager(process.cwd());
  let clientInstallCommand = '';
  let cliInstallCommand = '';

  switch (packageManager.name) {
    case 'npm':
      clientInstallCommand = 'npm install @intrig/next';
      cliInstallCommand = 'npm install -D intrig';
      break;
    case 'yarn':
      clientInstallCommand = 'yarn add @intrig/next';
      cliInstallCommand = 'yarn add -D intrig';
      break;
    case 'pnpm':
      clientInstallCommand = 'pnpm add @intrig/next';
      cliInstallCommand = 'pnpm add -D intrig';
      break;
    case 'bun':
      clientInstallCommand = 'bun add @intrig/next';
      cliInstallCommand = 'bun add -D intrig';
      break;
    default:
      throw new Error(`Unsupported package manager: ${packageManager.name}`);
  }

  try {
    cli.action.start('Installing @intrig/next dependency...');
    await execPromise(clientInstallCommand);
    cli.action.stop('@intrig/next has been installed successfully.');
  } catch (error) {
    cli.action.stop('Failed to install @intrig/next.');
    console.error(error);
  }

  try {
    cli.action.start('Installing intrig dev dependency...');
    await execPromise(cliInstallCommand);
  } catch (error) {
    cli.action.stop('Failed to install intrig dev dependency.');
    console.error(error);
  }

  const gitignorePath = path.resolve('.gitignore')
  const gitignoreEntry = '**/(generated)'
  cli.action.start('Updating .gitignore for next')
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8')
    if (!gitignoreContent.includes(gitignoreEntry)) {
      fs.appendFileSync(gitignorePath, `
${gitignoreEntry}`)
      cli.log(`Added '${gitignoreEntry}' to .gitignore`)
    }
  } else {
    fs.writeFileSync(gitignorePath, `${gitignoreEntry}
`)
    cli.log(`Created .gitignore and added '${gitignoreEntry}'`)
  }
  cli.action.stop()
}
