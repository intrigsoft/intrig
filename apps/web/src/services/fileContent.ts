import * as path from 'path'
import * as fs from 'fs'
import { INTRIG_LOCATION } from '@/const/locations';

export function fileContent(_path: string) {
  return fs.readFileSync(path.resolve(INTRIG_LOCATION, 'generated', 'src', `${_path}.ts`), 'utf-8');
}
