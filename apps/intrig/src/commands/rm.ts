import { Command, Args } from '@oclif/core'
import * as fs from 'fs'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { get as emoji } from 'node-emoji'
import {IntrigConfig} from "@intrig/cli-common";

export default class Rm extends Command {
  static override description = 'Remove an API source from the Intrig configuration'

  static override args = {
    source: Args.string({ description: 'ID of the source to remove', required: false }),
  }

  private configFile = 'intrig.config.json'

  async run() {
    const { args } = await this.parse(Rm)

    const config: IntrigConfig = this.readConfig()

    if (config.sources.length === 0) {
      this.log(chalk.yellow('No sources found in the configuration.'))
      return
    }

    let sourceToRemove = args.source

    if (!sourceToRemove) {
      sourceToRemove = await this.promptForSource(config)
    }

    const sourceIndex = config.sources.findIndex(source => source.id === sourceToRemove)

    if (sourceIndex === -1) {
      this.error(chalk.red(`No source found with ID: ${sourceToRemove}`))
    }

    const removedSource = config.sources.splice(sourceIndex, 1)[0]

    this.writeConfig(config)

    this.log(chalk`{green ${emoji('heavy_check_mark')} API source "${removedSource.name}" (ID: ${removedSource.id}) removed successfully.}`)

    if (config.addToGitOnUpdate !== false) {
      await this.addToGit()
    }
  }

  private readConfig(): IntrigConfig {
    if (!fs.existsSync(this.configFile)) {
      this.error(`Configuration file not found: ${this.configFile}`)
    }
    return JSON.parse(fs.readFileSync(this.configFile, 'utf-8'))
  }

  private writeConfig(config: IntrigConfig) {
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2))
  }

  private async promptForSource(config: IntrigConfig): Promise<string> {
    const choices = config.sources.map(source => ({
      name: `${source.name} (ID: ${source.id})`,
      value: source.id,
    }))

    const { sourceId } = await inquirer.prompt({
      type: 'list',
      name: 'sourceId',
      message: 'Select the API source to remove:',
      choices,
    })

    return sourceId
  }

  private async addToGit() {
    try {
      const simpleGit = require('simple-git')()
      await simpleGit.add(this.configFile)
      this.log(chalk`{green ${emoji('heavy_check_mark')} Added ${this.configFile} to git}`)
    } catch (error) {
      this.warn(`Failed to add ${this.configFile} to git: ${error}`)
    }
  }
}
