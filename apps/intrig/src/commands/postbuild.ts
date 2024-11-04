import {Args, Command, Flags} from '@oclif/core'
import { IntrigConfig } from '@intrig/cli-common';
import * as fs from 'fs';
import { CONFIG_FILE } from '../util';
import {adaptor as nextAdaptor} from '@intrig/intrig-next-binding'
import {adaptor as reactAdaptor} from '@intrig/intrig-react-binding'

export default class Postbuild extends Command {
  static override args = {

  }

  static override description = 'describe the command here'

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
        reactAdaptor.postBuild()
        break;
      case 'next':
        nextAdaptor.postBuild()
        break;
    }
  }
}
