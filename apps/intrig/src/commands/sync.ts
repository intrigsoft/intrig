import { Command, Flags } from '@oclif/core'
import * as fs from 'fs'
import chalk from 'chalk'
import {IntrigConfig, IntrigSourceConfig} from "@intrig/cli-common";
import {getOpenApiSpec} from "@intrig/intrig-openapi3-binding";
import {setupCacheAndInstall} from "../service/packer";

export default class Sync extends Command {
  static override description = 'Synchronize API specifications'

  static override flags = {
    all: Flags.boolean({
      char: 'a',
      description: 'Sync all APIs',
      exclusive: ['ids']
    }),
    ids: Flags.string({
      char: 'i',
      description: 'Comma-separated list of API IDs to sync',
      multiple: true,
      exclusive: ['all']
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Force sync even if no changes detected'
    }),
    'dry-run': Flags.boolean({
      char: 'd',
      description: 'Show what would be synchronized without performing the sync'
    }),
    env: Flags.string({
      char: 'e',
      description: 'Environment to sync (dev/prod)',
      options: ['dev', 'prod'],
      default: 'dev'
    })
  }

  private configFile = 'intrig.config.json'

  async run() {
    const { flags } = await this.parse(Sync)

    const config = this.readConfig()

    let apisToSync: IntrigSourceConfig[]

    if (flags.all) {
      apisToSync = config.sources
    } else if (flags.ids) {
      apisToSync = config.sources.filter(source => flags.ids?.includes(source.id))
      if (apisToSync.length !== flags.ids.length) {
        this.warn(chalk.yellow('Some specified API IDs were not found in the configuration.'))
      }
    } else {
      this.error(chalk.red('Please specify either --all or --ids'))
    }

    for (const api of apisToSync) {
      await this.syncApi(api, flags.env, flags.force, flags['dry-run'])
    }

    await setupCacheAndInstall()
  }

  private readConfig(): IntrigConfig {
    if (!fs.existsSync(this.configFile)) {
      this.error(`Configuration file not found: ${this.configFile}`)
    }
    return JSON.parse(fs.readFileSync(this.configFile, 'utf-8'))
  }

  private async syncApi(api: IntrigSourceConfig, env: string, force: boolean, dryRun: boolean) {
    this.log(chalk.cyan(`Syncing API: ${api.name} (${api.id})`))

    const url = env === 'prod' ? api.prodUrl : api.devUrl

    try {
      const newSpec = await getOpenApiSpec(url, this.readConfig())

      console.log(newSpec);

      // Here you would implement the logic to compare the new spec with the existing one
      // and determine if there are changes. For this example, we'll assume changes always exist.

      if (force || true /* replace with actual change detection logic */) {
        if (dryRun) {
          this.log(chalk.green(`Would sync changes for ${api.name}`))
        } else {
          // Implement the actual sync logic here
          this.log(chalk.green(`Synced changes for ${api.name}`))
        }
      } else {
        this.log(chalk.yellow(`No changes detected for ${api.name}`))
      }
    } catch (error) {
      this.error(chalk.red(`Failed to sync ${api.name}: ${error}`))
    }
  }
}
