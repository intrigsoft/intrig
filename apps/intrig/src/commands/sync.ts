import { Command, Flags } from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import {IntrigConfig, IntrigSourceConfig} from "@intrig/cli-common";
import {generateCode, generateFinalizationCode, getOpenApiSpec} from "@intrig/intrig-openapi3-binding";
import {setupCacheAndInstall} from "../service/packer";
import {CONFIG_FILE} from "../util";
import cli from 'cli-ux'

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
    /*'dry-run': Flags.boolean({
      char: 'd',
      description: 'Show what would be synchronized without performing the sync'
    }),*/
    env: Flags.string({
      char: 'e',
      description: 'Environment to sync (dev/prod)',
      options: ['dev', 'prod'],
      default: 'dev'
    })
  }

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

    await setupCacheAndInstall(async (_path) => {
      for (const api of apisToSync) {
        await this.syncApi(api, flags.env, flags.force, _path)
      }

      await generateFinalizationCode(flags.env, flags.force, _path, apisToSync)
    })
  }

  private readConfig(): IntrigConfig {
    if (!fs.existsSync(CONFIG_FILE)) {
      this.error(`Configuration file not found: ${CONFIG_FILE}`)
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
  }

  private async syncApi(api: IntrigSourceConfig, env: string, force: boolean, path: string) {
    // this.log(chalk.cyan(`Syncing API: ${api.name} (${api.id})`))

    try {
      cli.action.start(`Fetching OpenAPI for source ${api.name}`)
      const newSpec = await getOpenApiSpec(api.specUrl, this.readConfig())
      cli.action.stop()

      cli.action.start(`Generating code for source ${api.name}`)
      await generateCode(api, path, newSpec)
      cli.action.stop()

    } catch (error) {
      this.error(chalk.red(`Failed to sync ${api.name}: ${error}`))
    }
  }
}
