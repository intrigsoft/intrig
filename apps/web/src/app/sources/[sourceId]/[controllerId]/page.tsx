import * as fs from 'fs'
import * as path from 'path'
import { Documentation } from '@/components/Documentation';

export const dynamic = 'force-dynamic';

export default async function Index() {

  let filePath = path.resolve(process.cwd(), 'src/docs/controller.md');

  let json = {
    "id": "pet",
    "name": "pet",
    "description": "Everything about your Pets",
    "externalDocs": { "description": "Find out more", "url": "http://swagger.io" }
  }

  return (
    <>
      <Documentation filePath={filePath} variables={json} />
    </>
  );
}
