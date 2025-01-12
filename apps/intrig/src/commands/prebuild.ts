import {Args, Command, Flags} from '@oclif/core'
import { IntrigConfig } from '@intrig/cli-common';
import fs from 'fs';
import { CONFIG_FILE } from '../util';
import { adaptor as reactAdaptor } from '@intrig/intrig-react-binding';
import { adaptor as nextAdaptor } from '@intrig/intrig-next-binding';

export default class Prebuild extends Command {

  static hidden = true;

  static override args = {

  }

  static override description = 'Pre-build action for the Intrig CLI'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {

  }

  public async run(): Promise<void> {
    let config: IntrigConfig = { sources: [], generator: 'react' }
    if (fs.existsSync(CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
    }

    switch (config.generator) {
      case 'react':
        reactAdaptor.preBuild()
        break;
      case 'next':
        nextAdaptor.preBuild()
        break;
    }
  }
}
