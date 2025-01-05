import {Args, Command, Flags} from '@oclif/core'
import { ContentGeneratorAdaptor, IntrigConfig, IntrigSourceConfig } from '@intrig/cli-common';
import { adaptor as reactAdaptor } from '@intrig/intrig-react-binding';
import { adaptor as nextAdaptor } from '@intrig/intrig-next-binding';
import { setupCacheAndInstall } from '../service/packer';
import { extractEndpointInfo, getOpenApiSpec, getOpenApiSpecFromFile } from '@intrig/intrig-openapi3-binding';
import fs from 'fs';
import chalk from 'chalk'
import { CONFIG_FILE } from '../util';

export default class Generate extends Command {
  static override args = {
    file: Args.string({description: 'file to read'}),
  }

  static override description = 'Regenerate code'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

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

  public async run(): Promise<void> {
    try {
      const { flags } = await this.parse(Generate);

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

      let adaptor: ContentGeneratorAdaptor;
      switch (config.generator ?? 'react') {
        case 'react':
          adaptor = reactAdaptor;
          break;
        case 'next':
          adaptor = nextAdaptor;
          break;
      }

      await setupCacheAndInstall(async (_path) => {
        for (const api of apisToSync) {
          let spec = await getOpenApiSpecFromFile(api.id);
          let sourceInfo = extractEndpointInfo(api, spec);
          adaptor.generateSourceContent(api, _path, sourceInfo);
        }
        adaptor.generateGlobalContent(_path, apisToSync);
      }, config.generator ?? 'react', adaptor, apisToSync);
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
