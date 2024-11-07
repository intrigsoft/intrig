import {Command, Flags} from '@oclif/core'
import * as fs from 'fs'
import chalk from 'chalk'
import {ContentGeneratorAdaptor, IntrigConfig, IntrigSourceConfig} from "@intrig/cli-common";
import {extractEndpointInfo, getOpenApiSpec} from "@intrig/intrig-openapi3-binding";
import {setupCacheAndInstall} from "../service/packer";
import {CONFIG_FILE} from "../util";
import {adaptor as reactAdaptor} from "@intrig/intrig-react-binding";
import {adaptor as nextAdaptor} from "@intrig/intrig-next-binding";

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

    let adaptor: ContentGeneratorAdaptor
    switch (config.generator ?? 'react') {
      case 'react':
        adaptor = reactAdaptor
        break;
      case "next":
        adaptor = nextAdaptor
        break;
    }

    await setupCacheAndInstall(async (_path) => {
      for (const api of apisToSync) {
        let spec = await getOpenApiSpec(api.specUrl, config);
        let sourceInfo = extractEndpointInfo(api, spec);
        adaptor.generateSourceContent(api, _path, sourceInfo)
      }
      adaptor.generateGlobalContent(_path, apisToSync)
    }, config.generator ?? 'react', adaptor)
  }

  private readConfig(): IntrigConfig {
    if (!fs.existsSync(CONFIG_FILE)) {
      this.error(`Configuration file not found: ${CONFIG_FILE}`)
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
  }
}
