import { Command, Flags } from '@oclif/core'
import * as fs from 'fs'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { get as emoji } from 'node-emoji'
import Table from 'cli-table3'
import {CONFIG_FILE} from "../util";
import {IntrigConfig, IntrigSourceConfig} from "@intrig/cli-common";

export default class Ls extends Command {
  static override description = 'List API sources from the Intrig configuration'

  static override flags = {
    detailed: Flags.boolean({char: 'd', description: 'Show detailed information for each source'}),
    filter: Flags.string({char: 'f', description: 'Filter sources by name or ID'}),
  }

  async run() {
    const { flags } = await this.parse(Ls)

    const config = this.readConfig()

    if (config.sources.length === 0) {
      this.log(chalk.yellow('No sources found in the configuration.'))
      return
    }

    let sources = config.sources
    if (flags.filter) {
      sources = this.filterSources(sources, flags.filter)
    }

    if (sources.length === 0) {
      this.log(chalk.yellow(`No sources found matching filter: ${flags.filter}`))
      return
    }

    if (flags.detailed) {
      await this.showDetailedList(sources)
    } else {
      this.showSimpleList(sources)
    }
  }

  private readConfig(): IntrigConfig {
    if (!fs.existsSync(CONFIG_FILE)) {
      this.error(`Configuration file not found: ${CONFIG_FILE}`)
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
  }

  private filterSources(sources: IntrigSourceConfig[], filter: string): IntrigSourceConfig[] {
    const lowerFilter = filter.toLowerCase()
    return sources.filter(source =>
      source.id.toLowerCase().includes(lowerFilter) ||
      source.name.toLowerCase().includes(lowerFilter)
    )
  }

  private showSimpleList(sources: IntrigSourceConfig[]) {
    const table = new Table({
      head: ['ID', 'Name', 'Spec URL'],
      style: { head: ['cyan'] }
    })

    sources.forEach(source => {
      table.push([source.id, source.name, source.specUrl])
    })

    this.log(table.toString())
  }

  private async showDetailedList(sources: IntrigSourceConfig[]) {
    for (const source of sources) {
      this.log(chalk.cyan(`\n${emoji('information_source')} Details for source: ${source.name} (ID: ${source.id})`))
      this.log(chalk.grey('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
      this.log(`${chalk.bold('Spec URL:')} ${source.specUrl}`)
      if (source.regex) {
        this.log(`${chalk.bold('Regex:')} ${source.regex}`)
      }

      if (sources.indexOf(source) < sources.length - 1) {
        const { continue: shouldContinue } = await inquirer.prompt({
          type: 'confirm',
          name: 'continue',
          message: 'Show next source?',
          default: true
        })
        if (!shouldContinue) break
      }
    }
  }
}
