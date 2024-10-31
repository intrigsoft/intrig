import {jsonLiteral, typescript} from "@intrig/cli-common";
import * as path from "path";

export function tsConfigTemplate(_path: string) {
  const json = jsonLiteral(path.resolve(_path, 'tsconfig.json'))
  return json`
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@root/*": [
        "./src/lib/*"
      ]
    },
    "jsx": "react-jsx"
  },
  "exclude": [
    "node_modules",
    "**/__tests__/*"
  ]
}
  `
}
