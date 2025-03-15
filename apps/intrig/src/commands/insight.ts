import {Command, Flags} from '@oclif/core'
import { spawn } from 'child_process'
import * as path from 'path'

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

    // Build the path to web/server/main.js relative to this file
    const nextPath = path.join(__dirname, '../../../../web')
    const serverPath = path.join(__dirname, '../../../../web/server/main.js')

    console.log(`> Starting server at ${serverPath}`)

    // Pass the desired port to the server through the environment, if your server uses it
    const env = { ...process.env, PORT: String(port), NX_NEXT_DIR: nextPath }

    // Spawn the process running the server
    const child = spawn('node', [serverPath], { env, stdio: debug ? 'inherit' : 'ignore' })

    child.on('error', (err) => {
      this.error(`Failed to start server: ${err}`)
      process.exit(1)
    })

    // If your server logs a “started” message you could listen to stdout, but for simplicity,
    // here we use a short delay before opening the browser.
    setTimeout(() => {
      console.log(`> Server started at http://${hostname}:${port}`)
      open.default(`http://${hostname}:${port}`)
    }, 1000)
  }
}
