import { Command, Flags } from '@oclif/core';
import * as fs from 'fs';
import chalk from 'chalk';
import { baselineVersion } from '@intrig/intrig-openapi3-binding';
import { IntrigConfig, IntrigSourceConfig } from '@intrig/cli-common';
import { CONFIG_FILE } from '../util';
import semver from 'semver';

export default class Baseline extends Command {
  static override description = 'Create a baseline version for API specifications';

  static override flags = {
    id: Flags.string({
      char: 'i',
      description: 'ID of the API to baseline',
      required: true,
    }),
    version: Flags.string({
      char: 'v',
      description: 'Semantic or custom version for the baseline',
      required: true,
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Force baseline even if the version already exists',
    }),
  };

  async run() {
    try {
      const { flags } = await this.parse(Baseline);
      const config = this.readConfig();

      const apiConfig = config.sources.find((source) => source.id === flags.id);

      if (!apiConfig) {
        this.error(chalk.red(`API with ID '${flags.id}' not found in the configuration.`));
      }

      // Validate the version
      if (!semver.valid(flags.version) && !this.isCustomVersion(flags.version)) {
        this.error(chalk.red(`Invalid version '${flags.version}'. Please provide a valid semver or custom version.`));
      }

      const specUrl = apiConfig.specUrl;
      const apiName = apiConfig.id;

      if (!specUrl) {
        this.error(chalk.red(`Spec URL is not defined for API '${apiName}'.`));
      }

      // Perform the baseline operation
      try {
        await baselineVersion(apiName, flags.version);
        this.log(chalk.green(`Baseline created successfully for API '${apiName}' with version '${flags.version}'.`));
      } catch (e: any) {
        this.error(chalk.red(`Failed to create baseline: ${e.message}`));
      }
    } catch (e: any) {
      this.error(chalk.red(e.message));
    }
  }

  private readConfig(): IntrigConfig {
    if (!fs.existsSync(CONFIG_FILE)) {
      this.error(`Configuration file not found: ${CONFIG_FILE}`);
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  }

  private isCustomVersion(version: string): boolean {
    // Example logic for custom version validation
    return /^[a-zA-Z0-9_.-]+$/.test(version);
  }
}
