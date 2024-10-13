import {Command, Flags} from '@oclif/core'
import inquirer from 'inquirer'
import * as fs from 'fs'
import * as path from 'path'
import {CONFIG_FILE} from "../util";
import {IntrigConfig} from "@intrig/cli-common";

export default class Init extends Command {
  static override description = 'Initialize a new Intrig configuration file'

  static override flags = {
    'add-to-git': Flags.boolean({
      description: 'Add to git on update',
      allowNo: true,
    }),
    'reject-unauthorized': Flags.boolean({
      description: 'Reject unauthorized SSL connections',
      allowNo: true,
    }),
    'empty-body-type': Flags.string({
      description: 'Default type for empty body on POST requests',
      options: ['unknown', 'object', 'array', 'string', 'number', 'boolean', 'null', 'undefined'],
    }),
  }

  async run() {
    const { flags } = await this.parse(Init)

    let config: IntrigConfig = {
      sources: [],
    }

    // Handle addToGitOnUpdate
    if (flags['add-to-git'] === undefined) {
      const response = await inquirer.prompt({
        type: 'confirm',
        name: 'addToGit',
        message: 'Add to git on update?',
        default: false,
      })
      config.addToGitOnUpdate = response.addToGit
    } else {
      config.addToGitOnUpdate = flags['add-to-git']
    }

    // Handle rejectUnauthorized
    if (flags['reject-unauthorized'] === undefined) {
      const response = await inquirer.prompt({
        type: 'confirm',
        name: 'rejectUnauthorized',
        message: 'Reject unauthorized SSL connections?',
        default: true,
      })
      config.rejectUnauthorized = response.rejectUnauthorized
    } else {
      config.rejectUnauthorized = flags['reject-unauthorized']
    }

    // Write config to file
    const configPath = path.resolve(CONFIG_FILE)
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    this.log(`Intrig configuration file created at ${configPath}`)
    this.log('Use the "add" command to add API sources to your configuration.')
  }
}
