import {CompiledOutput, typescript} from "@intrig/cli-common";
import * as path from 'path'

export function loggerTemplate(_path: string) {
  const ts = typescript(path.resolve(_path, 'src', 'logger.ts'))

  return ts`
import pino, { Logger, LoggerOptions } from 'pino';

let logger: Logger;


const backendConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true, // Add colors
      translateTime: 'HH:MM:ss Z', // Human-readable timestamps
      ignore: 'pid,hostname', // Hide unnecessary fields
    }
  } : undefined,
};


const frontendConfig: LoggerOptions = {
  browser: {
    asObject: true,
  },
  level: 'info',
};


const createLogger = (): Logger => {
  if (typeof window === 'undefined') {
    return pino(backendConfig);
  } else {
    return pino(frontendConfig);
  }
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
