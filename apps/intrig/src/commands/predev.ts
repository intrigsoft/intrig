import {Command} from '@oclif/core'
import * as path from 'path'
import * as fs from 'fs-extra'
import {cli} from 'cli-ux'
import { IntrigConfig } from '@intrig/cli-common';
import { CONFIG_FILE } from '../util';
import { adaptor as reactAdaptor } from '@intrig/intrig-react-binding';
import { adaptor as nextAdaptor } from '@intrig/intrig-next-binding';

export default class Predev extends Command {
  static override args = {
  };

  static override description = 'Copy routes to main project';

  static override examples = [
    '$ intrig predev',
  ];

  static override flags = {
  };

  public async run(): Promise<void> {
    let config: IntrigConfig = { sources: [], generator: 'react' }
    if (fs.existsSync(CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
    }

    switch (config.generator) {
      case 'react':
        reactAdaptor.predev()
        break;
      case 'next':
        nextAdaptor.predev()
        break;
    }
  }
}
