import * as fs from 'fs-extra'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import {ux as cli} from "@oclif/core";
import {detectPackageManager} from "nypm";
import { ContentGeneratorAdaptor } from '@intrig/cli-common';

const execAsync = promisify(exec);

export async function setupCacheAndInstall(
  generateData: (path: string) => Promise<void>,
  generator: string,
  adaptor: ContentGeneratorAdaptor): Promise<void> {

  const tempDir = path.join('.intrig', 'generated')

  // Remove existing installation if it exists
  if (await fs.pathExists(tempDir)) {
    cli.action.start('Cleaning generated package files (excluding node_modules)')
    try {
      const files = await fs.readdir(tempDir)
      for (const file of files) {
        if (file !== 'node_modules') {
          await fs.remove(path.join(tempDir, file))
          console.log(`Removed ${file}`)
        }
      }
    } catch (e) {
      console.error('Failed to clean tempDir', e)
    } finally {
      cli.action.stop()
    }
  }

  // Ensure the temp directory exists
  await fs.ensureDir(tempDir)

  await generateData(path.resolve(tempDir))

  const packageManager = await detectPackageManager(process.cwd());

  // Install dependencies
  cli.action.start("Installing dependencies for the generated package")
  try {
    switch (packageManager.name) {
      case "npm":
        await execAsync('npm install', { cwd: tempDir })
        break;
      case "yarn":
        await execAsync('yarn install', { cwd: tempDir })
        break;
      case "pnpm":
        await execAsync('pnpm install', { cwd: tempDir })
        break;
      case "bun":
        await execAsync('bun install', { cwd: tempDir })
        break;
      default:
        console.error(new Error(`Unsupported package manager: ${packageManager.name}`))
    }
  } catch (e) {
    cli.action.stop('failed')
    console.error('Dependency installation failed', e)
    return
  }
  cli.action.stop()

  // Build the project
  cli.action.start("Building the generated package")
  try {
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
    }
  } catch (e: unknown) {
    cli.action.stop('failed')
    console.error('Build failed', e)
    return
  }
  cli.action.stop()

  const sourceLibDir = path.join(tempDir, 'dist')
  let client = 'react';
  switch (generator) {
    case 'next':
      client = 'next';
      break;
    case 'react':
      client = 'react';
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
    } finally {
      cli.action.stop()
    }
  }

  cli.action.start('Copying built libraries to project directory')
  try {
    await fs.copy(sourceLibDir, targetLibDir, {
      filter: (src) => !src.includes('api')
    })
  } catch (e) {
    console.error('Failed to copy built libraries', e)
  } finally {
    cli.action.stop()
  }

  await adaptor?.postCompile({
    tempDir,
    targetLibDir
  })
}
