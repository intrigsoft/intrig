import { ux as cli } from '@oclif/core'
import * as fs from 'fs-extra';
import * as path from 'path'

export async function predev() {
  const sourceDir = path.resolve('.intrig/generated/dist/api/(generated)');
  const destDir = path.resolve('src/app/api/(generated)');
  const gitignorePath = path.resolve('.gitignore');

  try {

    cli.action.start('Removing existing generated routes...');
    fs.removeSync(destDir);
    cli.action.stop();

    cli.action.start('Copying generated routes to main project...');
    await fs.copy(sourceDir, destDir, { overwrite: true });
    cli.action.stop(`Routes successfully copied to ${destDir}.`);

    // Update .gitignore to add **/__GENERATED__ if not already present
    let gitignoreContent = '';
    if (await fs.pathExists(gitignorePath)) {
      gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
    }
    const generatedEntry = '**/(generated)';
    if (!gitignoreContent.includes(generatedEntry)) {
      gitignoreContent += `\n${generatedEntry}`;
      await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');
    }
  } catch (error) {
    cli.action.stop('Failed to copy routes');
    console.error(error);
    // this.error(error);
  }
}
