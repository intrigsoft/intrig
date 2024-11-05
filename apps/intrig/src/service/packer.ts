import * as fs from 'fs-extra'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import cli from 'cli-ux'
import {detectPackageManager} from "nypm";

const execAsync = promisify(exec)

export async function setupCacheAndInstall(
  generateData: (path: string) => Promise<void>, generator: string): Promise<void> {
  // const tempDir = path.join(os.tmpdir(), 'intrig_generated')

  const tempDir = path.join('.intrig', 'generated')

  // Remove existing installation if it exists
  if (await fs.pathExists(tempDir)) {
    cli.action.start('Removing existing generated package files')
    await fs.remove(tempDir)
    cli.action.stop()
  }

  // Ensure the temp directory exists
  await fs.ensureDir(tempDir)

  await generateData(path.resolve(tempDir))

  // Build the project
  cli.action.start("Building the generated package")
  try {
    let packageManager = await detectPackageManager(process.cwd());
    switch (packageManager.name) {
      case "npm":
        await execAsync('npm run build', { cwd: tempDir })
        break;
      case "yarn":
        await execAsync('yarn build', { cwd: tempDir })
        break;
      case "pnpm":
        await execAsync('pnpm run build', { cwd: tempDir })
        break;
      case "bun":
        await execAsync('bun run build', { cwd: tempDir })
        break;
      default:
        console.error(new Error(`Unsupported package manager: ${packageManager.name}`))
    }
  } catch (e) {

  }
  cli.action.stop()

  // Copy all directories in <build>/dist/lib to projects node_modules/@intrig/client-react
  const sourceLibDir = path.join(tempDir, 'dist')
  let client = 'client-react';
  switch (generator) {
    case 'next':
      client = 'client-next';
      break;
    case 'react':
      client = 'client-react';
      break;
  }
  const targetLibDir = path.join(process.cwd(), 'node_modules', '@intrig', client, "src")

  if (await fs.pathExists(targetLibDir)) {
    cli.action.start('Removing existing target library files')
    try {
      await fs.readdir(targetLibDir).then(async (files) => {
        for (const file of files) {
          if (file !== 'package.json' && !file.endsWith('.md')) {
            await fs.remove(path.join(targetLibDir, file))
          }
        }
      })
    } catch (e) {
      console.error('Failed to remove existing target library files', e)
    }
    cli.action.stop()
  }

  cli.action.start('Copying built libraries to project directory')
  try {
    await fs.copy(sourceLibDir, targetLibDir, {
      filter: (src) => !src.includes('api')
    })
  } catch (e) {
    console.error('Failed to copy built libraries', e)
  }
  cli.action.stop()

  // Copy __GENERATED__ from src directory to target
  cli.action.start('Copying __GENERATED__ files to project directory')
  try {
    const generatedSourceDir = path.join(tempDir, 'src', 'api', '__GENERATED__')
    const generatedTargetDir = path.join(path.join(targetLibDir, ".."), '__GENERATED__')
    await fs.copy(generatedSourceDir, generatedTargetDir)
  } catch (e) {
    console.error('Failed to copy __GENERATED__ files', e)
  }
  cli.action.stop()

  // Clean up the temp directory
  // cli.action.start('Cleaning up the temp directory')
  // try {
  //   await fs.remove(tempDir)
  // } catch (e) {
  //   console.error('Failed to clean up temp directory', e)
  // }
  // cli.action.stop()
}
