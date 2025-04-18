import {Command} from '@oclif/core'
import * as fs from 'fs'
import * as fsx from 'fs-extra'
import * as path from 'path'
import {CONFIG_FILE} from "../util";
import { ContentGeneratorAdaptor, IntrigConfig } from '@intrig/cli-common';
import {ux as cli} from "@oclif/core";
import {adaptor as reactAdaptor} from '@intrig/intrig-react-binding'
import {adaptor as nextAdaptor} from '@intrig/intrig-next-binding'

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

    const config: IntrigConfig = {
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
        cli.stdout(`Added '${gitignoreEntry}' to .gitignore`)
      }
    } else {
      fs.writeFileSync(gitignorePath, `${gitignoreEntry}
`)
      cli.stdout(`Created .gitignore and added '${gitignoreEntry}'`)
    }
    cli.action.stop()

    cli.stdout(`Intrig configuration file created at ${configPath}`)

    const adaptor = generator === 'react' ? reactAdaptor : nextAdaptor

    // Add actions to package.json
    if (await fsx.pathExists(packageJsonPath)) {
      const packageJson = await fsx.readJson(packageJsonPath);
      packageJson.scripts = packageJson.scripts || {};
      if (!packageJson.scripts.predev?.includes('intrig predev')) {
        packageJson.scripts.predev = (packageJson.scripts.predev ? `${packageJson.scripts.predev} && ` : '') + 'intrig predev';
      }
      if (!packageJson.scripts.prebuild?.includes('intrig prebuild')) {
        packageJson.scripts.prebuild = (packageJson.scripts.prebuild ? `${packageJson.scripts.prebuild} && ` : '') + 'intrig prebuild';
      }
      if (!packageJson.scripts.postbuild?.includes('intrig postbuild')) {
        packageJson.scripts.postbuild = (packageJson.scripts.postbuild ? `${packageJson.scripts.postbuild} && ` : '') + 'intrig postbuild';
      }
      await fsx.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      console.log('Added predev and prebuild actions to package.json');
    } else {
      console.error('package.json not found');
    }


    if(adaptor) {
      adaptor.postInit()
    }

    cli.stdout('Use the "add" command to add API sources to your configuration.')
  }
}
