// lib/search.ts
import FlexSearch, { Document, IndexOptionsForDocumentSearch } from 'flexsearch';
import * as fs from 'fs';
import * as path from 'path';
import { RenderableTreeNode } from '@markdoc/markdoc';
import { INTRIG_LOCATION } from '@/const/locations';
import fg from 'fast-glob';
// import { capitalCase } from '@/lib/change-case';
import {capitalCase, SourceInfo} from '@intrig/cli-common';

export interface SearchResult {
  title: string;
  tags: string[];
  content: string;
  signature: string;
  url: string;
}

declare global {
  // Extending the global object to include swaggerIndex
  var swaggerIndex: Document<SearchResult, string[]> | undefined;
  var sourceNavs: {
    navs: any[]
  };
}

let index: Document<SearchResult, string[]>;
let navs: {
  navs: any[]
};

let options: IndexOptionsForDocumentSearch<SearchResult, string[]> = {
  document: {
    id: "url",
    index: ["url", "title", "content", "tags", "signature"],
    store: ["url", "title", "content", "tags", "signature"],
  },
  tokenize: "forward",
  // @ts-ignore
  suggest: true,
  cache: true,
  context: {
    resolution: 9,
    depth: 2,
    bidirectional: true
  },
  language: 'en'
};

async function addDocumentsToIndex() {

  const swaggerDocs: SearchResult[] = [];
  const navs = []

  const directoryToWatch = path.join(INTRIG_LOCATION, "generated", "src", "**", "registry.json");

  try {
    let files = await fg(directoryToWatch);
    for (let file of files) {
      let content: SourceInfo = JSON.parse(fs.readFileSync(file, 'utf8'));
      content.paths.forEach((path: any) => {
        let entry: SearchResult = {
          title: path.operationId,
          tags: [
            path.source,
            ...path.paths,
            path.operationId,
            `use${capitalCase(path.method)}`,
            path.requestUrl,
            path.summary,
            path.description,
            path.responseType,
            path.contentType,
            path.requetBody,
            path.responseBody,
          ],
          signature: `${path.method} ${path.requestUrl}`,
          content: "",
          url: `/sources/${path.source}/${path.paths.join('/')}/${path.operationId}`
        };
        swaggerDocs.push(entry)
      })

      navs.push({
        title: capitalCase(content.paths[0].source),
        links: content.controllers.map((c: any) => ({
          title: c.name,
          href: `/sources/${content.paths[0].source}/${c.name}`
        }))
      })

      Object.entries(content.schemas).forEach(([name, schema]) => {
        let entry: SearchResult = {
          title: name,
          tags: [
            name
          ],
          signature: "",
          content: "",
          url: `/sources/${content.paths[0].source}/schema/${name}`
        }
        swaggerDocs.push(entry)
      })
      navs.find(n => n.title === content.paths[0].source)?.links.push({
        title: "Schemas",
        href: `/sources/${content.paths[0].source}/schema`
      })
    }
  } catch (e) {

  }

  swaggerDocs.forEach((doc) => global.swaggerIndex?.add(doc));
  sourceNavs.navs = navs;
}

export function reindex() {
  global.swaggerIndex = new FlexSearch.Document<SearchResult, string[]>(options);
  addDocumentsToIndex();
}

fs.watch(INTRIG_LOCATION, { recursive: true }, (eventType, filename) => {
  console.log('File changed', eventType, filename);
  reindex()
})

if (!global.sourceNavs) {
  global.sourceNavs = {
    navs: []
  }
}

if (!global.swaggerIndex) {
  global.swaggerIndex = new FlexSearch.Document<SearchResult, string[]>(options);
  addDocumentsToIndex();
}

index = global.swaggerIndex;

navs = global.sourceNavs;

export { index, navs };

function extractText(node: RenderableTreeNode): string {
  if (typeof node === 'string') {
    return node;
  }

  if (typeof node === 'object' && node !== null) {
    if ('children' in node && Array.isArray(node.children)) {
      return node.children.map(extractText).join('');
    }
  }

  return '';
}

export function search(query: string, limit?: number): SearchResult[] {
  // @ts-ignore
  const results = index.search(query, {
    enrich: true,
    suggest: true,
    fuzzy: 0.2,
    boost: {
      signature: 3,
      title: 2,    // Title matches are twice as important
      tags: 1.5,   // Tag matches are 1.5x as important
      content: 1   // Normal weight for content
    },
    limit,
  });

  let finalResults: SearchResult[] = [];
  for (const result of results) {
    if (limit && finalResults.length >= limit) break;
    for (const r of result.result) {
      if (limit && finalResults.length >= limit) break;
      let doc = (r as any).doc;
      if (!finalResults.some(f => f.url === doc?.url)) {
        finalResults.push(doc);
      }
    }
  }

  return finalResults
}
