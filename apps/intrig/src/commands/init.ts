import {Command} from '@oclif/core'
import * as fs from 'fs'
import * as fsx from 'fs-extra'
import * as path from 'path'
import {CONFIG_FILE} from "../util";
import { ContentGeneratorAdaptor, IntrigConfig } from '@intrig/cli-common';
import {cli} from "cli-ux";

export default class Init extends Command {
  static override description = 'Initialize a new Intrig configuration file'

  async run() {
    // Load package.json to determine project type
    const packageJsonPath = path.resolve('package.json')
    if (!fs.existsSync(packageJsonPath)) {
      this.error('package.json not found. Please run this command in the root of a valid project.')
    }

    cli.action.start('Loading package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    cli.action.stop()

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

    // Validate TypeScript setup
    if (!('typescript' in dependencies)) {
      cli.warn('Intrig works best with TypeScript. Consider adding TypeScript to your project for the best experience.');
    }

    // Identify project type and generator
    let generator: 'react' | 'next' = 'react'
    if ('next' in dependencies) {
      const nextVersion = dependencies['next'].replace(/[^0-9.]/g, '').split('.')[0]
      if (parseInt(nextVersion, 10) >= 13) {
        generator = 'next'
      } else {
        this.error('Only Next.js projects version 13 or above are supported for the App Router. Please upgrade your Next.js version.')
      }
    } else if (!('react' in dependencies)) {
      this.error('This project is neither a React nor a Next.js project. Please ensure your project uses either React or Next.js.')
    }

    let config: IntrigConfig = {
      sources: [],
      generator
    }

    // Write config to file
    const configPath = path.resolve(CONFIG_FILE)
    cli.action.start('Writing Intrig configuration file')
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    cli.action.stop()

    // Add .intrig/generated to .gitignore
    const gitignorePath = path.resolve('.gitignore')
    const gitignoreEntry = '.intrig/generated'
    cli.action.start('Updating .gitignore')
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

    cli.log(`Intrig configuration file created at ${configPath}`)

    const adaptor = await import((`@intrig/intrig-${generator}-binding`)).then(m => m?.adaptor as ContentGeneratorAdaptor)

    // Add actions to package.json
    if (await fsx.pathExists(packageJsonPath)) {
      const packageJson = await fsx.readJson(packageJsonPath);
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.predev = 'intrig predev';
      packageJson.scripts.prebuild = 'intrig prebuild';
      await fsx.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      console.log('Added predev and prebuild actions to package.json');
    } else {
      console.error('package.json not found');
    }


    if(adaptor) {
      adaptor.postInit()
    }

    cli.log('Use the "add" command to add API sources to your configuration.')
  }
}
