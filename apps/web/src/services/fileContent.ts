import * as path from 'path'
import * as fs from 'fs'
import { GENERATED_LOCATION } from '@/const/locations';

export function fileContent(_path: string) {
  return fs.readFileSync(path.resolve(GENERATED_LOCATION, 'generated', 'src', `${_path}.ts`), 'utf-8');
}
