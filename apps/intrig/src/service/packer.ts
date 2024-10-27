import * as fs from 'fs-extra'
import * as path from 'path'
import {addDependency, removeDependency, detectPackageManager} from 'nypm'
import { exec } from 'child_process'
import { promisify } from 'util'
import cli from 'cli-ux'

const execAsync = promisify(exec)

export async function setupCacheAndInstall(
  generateData: (path: string) => Promise<void>
): Promise<void> {
  const cacheDir = path.join(process.cwd(), '.intrig')
  const generatedDir = path.join(cacheDir, 'generated')

  // Ensure the cache directory exists
  await fs.ensureDir(cacheDir)

  // Remove existing installation if it exists
  if (await fs.pathExists(generatedDir)) {
    cli.action.start('Removing existing generated package files')
    await fs.remove(generatedDir)
    cli.action.stop()
  }

  // Ensure the generated directory exists
  await fs.ensureDir(generatedDir)

  await generateData(path.resolve(path.join(generatedDir)))

  // Build the project
  cli.action.start("Building the generated package")
  try {
    let packageManager = await detectPackageManager(process.cwd());
    switch (packageManager.name) {
      case "npm":
        await execAsync('npm run build', { cwd: generatedDir })
        break;
      case "yarn":
        await execAsync('yarn build', { cwd: generatedDir })
        break;
      case "pnpm":
        await execAsync('pnpm run build', { cwd: generatedDir })
        break;
      case "bun":
        await execAsync('bun run build', { cwd: generatedDir })
        break;
      default:
        console.error(new Error(`Unsupported package manager: ${packageManager.name}`))
    }
  } catch (e) {

  }
  cli.action.stop()

  try {
    cli.action.start("Removing @intrig/generated package")
    await removeDependency('@intrig/generated')
    cli.action.stop()
  } catch (error) {
    console.warn('Failed to uninstall existing package. It may not have been installed.')
  }

  // Install the generated package in the current project
  cli.action.start('Installing the generated package...')
  await addDependency('file:.intrig/generated')

  cli.action.stop()
}
