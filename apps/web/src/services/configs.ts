import fs from 'fs';
import path from 'path';
import { INTRIG_LOCATION } from '@/const/locations';

export interface IntrigSourceConfig {
  id: string;
  name: string;
  specUrl: string;
  devUrl: string;
  prodUrl: string;
  regex?: string;
  sourceDir?: string;
}

export interface IntrigConfig {
  addToGitOnUpdate?: boolean;
  rejectUnauthorized?: boolean;
  emptyBodyTypeOnPost?: "unknown" | "object" | "array" | "string" | "number" | "boolean" | "null" | "undefined";
  sources: IntrigSourceConfig[];
  generator: 'react' | 'next'
}

export function getConfig(): IntrigConfig {
  let configLocation = path.resolve(INTRIG_LOCATION, '..', 'intrig.config.json');
  console.log('Loading config from', configLocation);
  if (fs.existsSync(configLocation)) {
    let s = fs.readFileSync(configLocation, 'utf8');
    return JSON.parse(s) as IntrigConfig;
  } else {
    return {
      sources: [],
      generator: 'next',
    } as IntrigConfig
  }
}
