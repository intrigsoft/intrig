import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { ux as cli } from '@oclif/core'
import compareSwaggerDocs from './openapi3-diff';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const apiVersionsDir = path.join(process.cwd(), '.intrig', 'specs');

export async function saveOpenApiDocument(apiName: string, content: string): Promise<void> {
  const apiDir = path.join(apiVersionsDir, apiName);
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  const latestFileName = `${apiName}-latest.json`;
  const previousFileName = `${apiName}-previous.json`;
  const latestFilePath = path.join(apiDir, latestFileName);
  const previousFilePath = path.join(apiDir, previousFileName);

  // Check if latest file exists and compare content
  if (fs.existsSync(latestFilePath)) {
    const latestContent = await readFile(latestFilePath, 'utf8');

    cli.action.start('Calculating differences');
    const differences = compareSwaggerDocs(
      JSON.parse(latestContent),
      JSON.parse(content)
    );
    cli.action.stop();

    if (!Object.keys(differences).length) {
      cli.stdout('No changes detected. Operation aborted.');
      return;
    }

    // Move the latest file to previous file
    cli.action.start('Archiving the latest document as previous');
    fs.renameSync(latestFilePath, previousFilePath);
    cli.action.stop();
  }

  // Save the new latest document
  cli.action.start('Saving OpenAPI document');
  await writeFile(latestFilePath, content);
  cli.action.stop();

  cli.stdout(`Saved OpenAPI document: ${latestFilePath}`);
}

export async function getLatestVersion(apiName: string): Promise<any> {
  const latestFilePath = path.join(apiVersionsDir, apiName, `${apiName}-latest.json`);

  if (fs.existsSync(latestFilePath)) {
    console.log(`Using latest version: ${latestFilePath}`);
    const latestContent = await readFile(latestFilePath, 'utf8');
    return JSON.parse(latestContent);
  }

  throw new Error('No versions available for this API.');
}

export async function baselineVersion(apiName: string, version: string): Promise<void> {
  const apiDir = path.join(apiVersionsDir, apiName);
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  const latestFileName = `${apiName}-latest.json`;
  const previousFileName = `${apiName}-previous.json`;
  const versionedFileName = `${apiName}-${version}.json`;
  const latestFilePath = path.join(apiDir, latestFileName);
  const previousFilePath = path.join(apiDir, previousFileName);
  const versionedFilePath = path.join(apiDir, versionedFileName);
  const metaInfoPath = path.join(apiDir, 'metaInfo.json');

  if (!fs.existsSync(latestFilePath)) {
    throw new Error('No latest version available to baseline.');
  }

  // Move the latest file to previous file
  cli.action.start('Archiving the latest document as previous');
  if (fs.existsSync(previousFilePath)) {
    fs.unlinkSync(previousFilePath); // Remove existing previous file if exists
  }
  fs.copyFileSync(latestFilePath, previousFilePath);
  cli.action.stop();

  // Copy the latest file to the versioned file
  cli.action.start(`Saving versioned document: ${versionedFileName}`);
  fs.copyFileSync(latestFilePath, versionedFilePath);
  cli.action.stop();

  // Update metaInfo file
  let metaInfo = [];
  if (fs.existsSync(metaInfoPath)) {
    const metaInfoContent = await readFile(metaInfoPath, 'utf8');
    metaInfo = JSON.parse(metaInfoContent);
  }

  metaInfo.push({
    version,
    fileName: versionedFileName,
    timestamp: new Date().toISOString(),
  });

  await writeFile(metaInfoPath, JSON.stringify(metaInfo, null, 2));

  cli.stdout(`Baseline created for version: ${version}`);
}
