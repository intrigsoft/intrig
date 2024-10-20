import { Command, Flags } from '@oclif/core'
import * as fs from 'fs'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { get } from 'node-emoji'
import simpleGit from 'simple-git'
import {CONFIG_FILE} from "../util";
import * as path from 'path'
import {IntrigConfig, IntrigSourceConfig, ServerInfo} from "@intrig/cli-common";
import {getServerInfo} from "@intrig/intrig-openapi3-binding";

export default class Add extends Command {
  static override description = 'Add a new API source to the Intrig configuration'

  static override flags = {
    source: Flags.string({ char: 's', description: 'OpenAPI specification URL' }),
    'dev-url': Flags.string({ char: 'd', description: 'Development base URL' }),
    'prod-url': Flags.string({ char: 'p', description: 'Production base URL' }),
    id: Flags.string({ char: 'i', description: 'Unique ID for the API' }),
    'source-path': Flags.string({ description: 'Custom source path for generated boilerplate' }),
  }

  async run() {
    const { flags } = await this.parse(Add)

    let config: IntrigConfig = { sources: [] }
    if (fs.existsSync(CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
    }

    const { url, data } = await this.getUrlAndData(config, flags.source)
    const newSource = await this.promptForSourceDetails(url, data, flags)

    config.sources.push(newSource)
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))

    this.log(chalk`{green ${get('heavy_check_mark')} API Added}`)

    if (config.addToGitOnUpdate !== false) {
      await this.addToGit()
    }
  }

  private async getUrlAndData(config: IntrigConfig, source?: string): Promise<{ url: string; data: ServerInfo }> {
    let url = source
    if (!url) {
      const response = await inquirer.prompt({
        type: 'input',
        name: 'specUrl',
        message: 'What is the OpenAPI specification URL?',
      })
      url = response.specUrl
    }

    try {
      this.log(chalk`{blue Fetching OpenAPI config}`)
      const data = await getServerInfo(url!, config)
      return { url: url!, data }
    } catch (error) {
      this.error(chalk.red('Could not fetch data for the given input. Please try again.'), { exit: false })
      return this.getUrlAndData(config, undefined)
    }
  }

  private async promptForSourceDetails(specUrl: string, data: ServerInfo, flags: any): Promise<IntrigSourceConfig> {
    const serverUrl = data.serverUrls[0]

    const devUrl = flags['dev-url'] || await this.prompt('devUrl', 'What is the development base URL?', serverUrl)
    const prodUrl = flags['prod-url'] || await this.prompt('prodUrl', 'What is the production base URL?', serverUrl)

    const id = flags.id || await this.prompt('id', 'Please enter an ID for the API:', undefined, this.validateId)

    let sourcePath = flags['source-path']
    if (!sourcePath) {
      const useDefaultPath = await inquirer.prompt({
        type: 'confirm',
        name: 'useDefault',
        message: `Use default source path (api/${id})?`,
        default: true,
      })

      if (!useDefaultPath.useDefault) {
        sourcePath = await this.prompt('sourcePath', 'Enter custom source path:', undefined, this.validateSourcePath)
      }
    }

    return {
      id,
      name: data.title,
      specUrl,
      devUrl,
      prodUrl,
      sourceDir: sourcePath || path.join('api', id),
    }
  }

  private async prompt(name: string, message: string, defaultValue?: string, validate?: (input: string) => boolean | string) {
    const response = await inquirer.prompt({
      type: 'input',
      name,
      message,
      default: defaultValue,
      validate,
    })
    return response[name]
  }

  private validateId(input: string): boolean | string {
    return /^[a-zA-Z][a-zA-Z0-9_]+$/.test(input) ||
      'Invalid format. The ID should be alphanumeric, start with a letter, and may include underscores.'
  }

  private validateSourcePath(input: string): boolean | string {
    return input.trim() !== '' || 'Source path cannot be empty.'
  }

  private async addToGit() {
    try {
      await simpleGit().add(CONFIG_FILE)
      this.log(chalk`{green ${get('heavy_check_mark')} Added ${CONFIG_FILE} to git}`)
    } catch (error) {
      this.warn(`Failed to add ${CONFIG_FILE} to git: ${error}`)
    }
  }
}
