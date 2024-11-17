import { Command, Flags } from '@oclif/core';
import * as fs from 'fs';
import chalk from 'chalk';
import { IntrigConfig, IntrigSourceConfig } from '@intrig/cli-common';
import { syncOpenApiSpec } from '@intrig/intrig-openapi3-binding';
import { CONFIG_FILE } from '../util';

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
    env: Flags.string({
      char: 'e',
      description: 'Environment to sync (dev/prod)',
      options: ['dev', 'prod'],
      default: 'dev'
    })
  }

  async run() {
    try {
      const { flags } = await this.parse(Sync);

      const config = this.readConfig();

      let apisToSync: IntrigSourceConfig[];

      if (flags.all) {
        apisToSync = config.sources;
      } else if (flags.ids) {
        apisToSync = config.sources.filter(source => flags.ids?.includes(source.id));
        if (apisToSync.length !== flags.ids.length) {
          this.warn(chalk.yellow('Some specified API IDs were not found in the configuration.'));
        }
      } else {
        this.error(chalk.red('Please specify either --all or --ids'));
      }

      for (let intrigSourceConfig of apisToSync) {
        try {
          await syncOpenApiSpec(intrigSourceConfig.specUrl, intrigSourceConfig.id, config)
        } catch (e: any) {
          console.error(e)
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  private readConfig(): IntrigConfig {
    if (!fs.existsSync(CONFIG_FILE)) {
      this.error(`Configuration file not found: ${CONFIG_FILE}`)
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
  }
}
