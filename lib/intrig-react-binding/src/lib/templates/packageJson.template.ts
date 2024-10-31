import {jsonLiteral, typescript} from "@intrig/cli-common";
import * as path from "path";

export function packageJsonTemplate(_path: string) {
  const json = jsonLiteral(path.resolve(_path, 'package.json'))
  return json`
{
  "name": "@intrig/generated",
  "version": "d${Date.now()}",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "module-alias": "^2.2.2",
    "axios": "^1.7.7",
    "immer": "^10.1.1",
    "zod": "^3.23.8"
  },
  "peerDependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/glob": "^8.1.0"
  },
  "_moduleAliases": {
    "@root": "./src/lib"
  }
}
  `
}
