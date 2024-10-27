import { execSync } from 'child_process';
import { join } from 'path';
import {useGetPetById} from '@intrig/generated/dist/lib/petstore/pet/getPetById'

describe('CLI tests', () => {
  it('should print a message', () => {
    const cliPath = join(process.cwd(), 'dist/apps/intrig');

    const output = execSync(`node ${cliPath}`).toString();

    expect(output).toMatch(/Hello World/);
  });
});
