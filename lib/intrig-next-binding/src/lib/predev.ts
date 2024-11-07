import { cli } from 'cli-ux';
import * as fs from 'fs-extra';
import * as path from 'path'

export async function predev() {
  const sourceDir = path.resolve('node_modules/@intrig/client-next/(generated)');
  const destDir = path.resolve('src/app/api/(generated)');
  const gitignorePath = path.resolve('.gitignore');

  try {
    cli.action.start('Copying generated routes to main project...');
    await fs.copy(sourceDir, destDir, { overwrite: true });
    cli.action.stop('Routes successfully copied to src/app/.');

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
    this.error(error);
  }
}
