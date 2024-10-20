import * as fs from 'fs-extra'
import * as path from 'path'
import {addDependency, removeDependency, detectPackageManager} from 'nypm'
import { exec } from 'child_process'
import { promisify } from 'util'

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
    console.log('Removing existing generated package...')
    await fs.remove(generatedDir)

    // Uninstall the existing package from the project
    try {
      await removeDependency('@intrig/generated')
      console.log('Existing @intrig/generated package uninstalled.')
    } catch (error) {
      console.warn('Failed to uninstall existing package. It may not have been installed.')
    }
  }

  // Ensure the generated directory exists
  await fs.ensureDir(generatedDir)

  await generateData(path.resolve(path.join(generatedDir)))

  // Create a simple index.ts file (you'll replace this with your generated code later)
  // await fs.writeFile(path.join(generatedDir, 'index.ts'), 'export const placeholder = "Generated code will go here";')

  // Create package.json
  const packageJson = {
    name: '@intrig/generated',
    version: '1.0.0',
    private: true,
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc'
    },
    dependencies: {
      'module-alias': '^2.2.2',
      "axios": "^1.7.7",
    },
    "peerDependencies": {
      "react": "18.3.1",
      "react-dom": "18.3.1",
    },
    "devDependencies": {
      "@types/glob": "^8.1.0",
    },
    _moduleAliases: {
      '@root': './src/lib'
    }
  }

  await fs.writeJson(path.join(generatedDir, 'package.json'), packageJson, { spaces: 2 })

  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: "es2018",
      module: "commonjs",
      declaration: true,
      outDir: "./dist",
      strict: true,
      esModuleInterop: true,
      baseUrl: '.',
      paths: {
        "@root/*": ["./src/lib/*"]
      },
      "jsx": "react-jsx"
    },
    exclude: ["node_modules", "**/__tests__/*"]
  }

  await fs.writeJson(path.join(generatedDir, 'tsconfig.json'), tsConfig, { spaces: 2 })

  // Build the project
  // console.log('Building the generated package...')
  // try {
  //   let packageManager = await detectPackageManager(process.cwd());
  //   switch (packageManager.name) {
  //     case "npm":
  //       await execAsync('npm run build', { cwd: generatedDir })
  //       break;
  //     case "yarn":
  //       await execAsync('yarn build', { cwd: generatedDir })
  //       break;
  //     case "pnpm":
  //       await execAsync('pnpm run build', { cwd: generatedDir })
  //       break;
  //     case "bun":
  //       await execAsync('bun run build', { cwd: generatedDir })
  //       break;
  //     default:
  //       console.error(new Error(`Unsupported package manager: ${packageManager.name}`))
  //   }
  // } catch (e) {
  //
  // }
  //
  // // Install the generated package in the current project
  // console.log('Installing the generated package...')
  // await addDependency('file:.intrig/generated')
  //
  // console.log('Cache setup complete and @intrig/generated installed as a dependency.')
}
