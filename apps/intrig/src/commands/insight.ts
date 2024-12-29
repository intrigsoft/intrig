import {Command, Flags} from '@oclif/core'
import { createServer } from 'http';
import { parse } from 'node:url';
import * as path from 'path';
import next from 'next';

export default class Insight extends Command {

  static override description = 'Starts web view for intrig insight'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    port: Flags.integer({
      char: 'p',
      description: 'Port to run the Next.js server on',
      default: 7007,
    }),
    debug: Flags.boolean({
      char: 'd',
      description: 'Enable debug mode to show server-side logs',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Insight);
    const port = flags.port;
    const debug = flags.debug;
    const hostname = process.env.HOST || 'localhost';

    const open = await import('open');

    // Set the directory and environment mode for Next.js
    const dir = process.env.NX_NEXT_DIR || path.join(__dirname, '../../../../web');
    const dev = false;

    // Start the Next.js server
    const startServer = async () => {
      const nextApp = next({ dev, dir, quiet: !debug });
      const handle = nextApp.getRequestHandler();

      await nextApp.prepare();

      const server = createServer((req, res) => {
        const parsedUrl = parse(req.url ?? '', true);
        handle(req, res, parsedUrl);
      });

      server.listen(port, hostname, () => {
        console.log(`> Server started at http://${hostname}:${port}`); // Always log server start
        if (debug) {
          console.log('Debug mode enabled. Server-side logs will be displayed.');
        }
        open.default(`http://${hostname}:${port}`);
      });

      server.on('error', (err) => {
        console.error('Server encountered an error:', err);
      });
    };

    await startServer().catch((err) => {
      this.error(`Failed to start server: ${err}`);
      process.exit(1);
    });
  }
}
