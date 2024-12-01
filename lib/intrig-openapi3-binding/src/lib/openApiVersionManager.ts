import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as openApiDiff from 'openapi-diff';
import { cli } from 'cli-ux';
import compareSwaggerDocs from './openapi3-diff';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const apiVersionsDir = path.join(process.cwd(), '.intrig', 'specs');
const indexFileName = 'index.json';

interface VersionIndex {
  fileName: string;
  timestamp: string;
}

export async function saveOpenApiDocument(apiName: string, version: string, content: string): Promise<void> {
  const apiDir = path.join(apiVersionsDir, apiName);
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  const indexPath = path.join(apiDir, indexFileName);
  let index: VersionIndex[] = [];
  if (fs.existsSync(indexPath)) {
    const indexContent = await readFile(indexPath, 'utf8');
    index = JSON.parse(indexContent);
  }

  const latestEntry = index.length > 0 ? index[index.length - 1] : null;
  if (latestEntry) {
    const latestContentPath = path.join(apiDir, latestEntry.fileName);
    const latestContent = await readFile(latestContentPath, 'utf8');

    cli.action.start('Calculating differences');
    let differences = compareSwaggerDocs(
      JSON.parse(latestContent),
      JSON.parse(content)
    );
    cli.action.stop();

    if (!Object.keys(differences).length) {
      cli.info('No changes detected. Version not updated.');
      return;
    }
  }

  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
  const fileName = `${apiName}_${version}_${timestamp}.json`;
  const filePath = path.join(apiDir, fileName);

  cli.action.start('Saving OpenAPI document');
  await writeFile(filePath, content);

  // Update index file
  index.push({ fileName, timestamp });
  await writeFile(indexPath, JSON.stringify(index, null, 2));
  cli.action.stop();

  cli.info(`Saved OpenAPI document: ${indexPath}${fileName}`);
}

export async function getLatestVersion(apiName: string): Promise<any> {
  const indexPath = path.join(apiVersionsDir, apiName, indexFileName);
  if (fs.existsSync(indexPath)) {
    const indexContent = await readFile(indexPath, 'utf8');
    const index: VersionIndex[] = JSON.parse(indexContent);
    if (index.length > 0) {
      const latestFileName = index[index.length - 1].fileName;
      console.log(
        `Using latest version: ${latestFileName} (${index[index.length - 1].timestamp})`)
      const latestContent = await readFile(path.join(apiVersionsDir, apiName, latestFileName), 'utf8');
      return JSON.parse(latestContent);
    }
  }
  throw new Error('No versions available for this API.');
}

export async function listVersions(apiName: string): Promise<VersionIndex[]> {
  const indexPath = path.join(apiVersionsDir, apiName, indexFileName);
  if (!fs.existsSync(indexPath)) {
    throw new Error('No versions available for this API.');
  }

  const indexContent = await readFile(indexPath, 'utf8');
  const index: VersionIndex[] = JSON.parse(indexContent);
  return index;
}
