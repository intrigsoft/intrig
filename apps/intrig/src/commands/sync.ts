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

      for (const intrigSourceConfig of apisToSync) {
        try {
          await syncOpenApiSpec(intrigSourceConfig.specUrl, intrigSourceConfig.id, config)
        } catch (e: unknown) {
          if (e instanceof Error) {
            console.error(e.message);
          } else {
            console.error('An unknown error occurred:', e);
          }
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
