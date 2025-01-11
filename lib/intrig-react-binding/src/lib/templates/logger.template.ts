import {CompiledOutput, typescript} from "@intrig/cli-common";
import * as path from 'path'

export function loggerTemplate(_path: string) {
  const ts = typescript(path.resolve(_path, 'src', 'logger.ts'))

  return ts`
import pino, { Logger, LoggerOptions } from 'pino';

let logger: Logger;

const frontendConfig: LoggerOptions = {
  browser: {
    asObject: true,
  },
  level: 'info',
};


const createLogger = (): Logger => {
  return pino(frontendConfig);
};

const getLogger = (): Logger => {
  if (!logger) {
    logger = createLogger();
  }
  return logger;
};

const log = {
  info: (msg: string, meta?: object) => getLogger().info(meta, msg),
  warn: (msg: string, meta?: object) => getLogger().warn(meta, msg),
  error: (msg: string, meta?: object) => getLogger().error(meta, msg),
  debug: (msg: string, meta?: object) => getLogger().debug(meta, msg),
};

export default log;
`
}
