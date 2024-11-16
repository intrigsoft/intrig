// lib/search.ts
import FlexSearch, { Document } from 'flexsearch';
import * as fs from 'fs';
import * as path from 'path';
import Markdoc, { RenderableTreeNode } from '@markdoc/markdoc';
import yaml from 'yaml';
import { GENERATED_LOCATION } from '@/const/locations';
import { walkDirectory } from '@/services/walkDirectory';

export interface SearchResult {
  title: string;
  tags: string[];
  content: string;
  signature: string;
  url: string;
}

declare global {
  // Extending the global object to include swaggerIndex
  var swaggerIndex: Document<SearchResult> | undefined;
}

let index: Document<SearchResult>;

function createIndex() {
  console.log('Creating new index');
  global.swaggerIndex = new FlexSearch.Document<SearchResult>({
    document: {
      id: "url",
      index: ["url", "title", "content", "tags", "signature"],
      store: ["title", "content", "tags", "url", "signature"],
    },
    tokenize: "forward",
    suggest: true,
    cache: true,
    context: {
      resolution: 9,
      depth: 2,
      bidirectional: true
    }
  });
}

function addDocumentsToIndex() {

  const swaggerDocs: SearchResult[] = [];

  walkDirectory(path.resolve(GENERATED_LOCATION, 'generated', 'src'  /*__dirname, '../../src/api'*/), (filePath, stats) => {
    if (stats.isFile() && path.extname(filePath) === '.md') {
      let content = fs.readFileSync(filePath, 'utf8');
      let ast = Markdoc.parse(content);
      let tags: string[] = [];
      let title = '';
      let signature = '';
      if (ast.attributes.frontmatter) {
        let frontmatter = yaml.parse(ast.attributes.frontmatter);
        tags = frontmatter['tags'];
        title = frontmatter['title'];
        signature = frontmatter['requestSignature'] ?? '';
      }
      let transformed = Markdoc.transform(ast);
      let data = extractText(transformed);

      let entry: SearchResult = {
        title,
        tags,
        signature,
        content: data,
        url: `/sources/${path.relative(path.resolve(GENERATED_LOCATION, 'generated', 'src'), path.dirname(filePath))}`
      };

      swaggerDocs.push(entry)
    }
  })

  swaggerDocs.forEach((doc) => global.swaggerIndex?.add(doc));
}

export function reindex() {
  createIndex();
  addDocumentsToIndex();
}

fs.watch(GENERATED_LOCATION, { recursive: true }, (eventType, filename) => {
  console.log('File changed', eventType, filename);
  reindex()
})

if (!global.swaggerIndex) {
  global.swaggerIndex = new FlexSearch.Document<SearchResult>({
    document: {
      id: "url",
      index: ["url", "title", "content", "tags", "signature"],
      store: ["url", "title", "content", "tags", "signature"],
    },
    tokenize: "forward",
    suggest: true,
    cache: true,
    context: {
      resolution: 9,
      depth: 2,
      bidirectional: true
    }
  });
  addDocumentsToIndex();
}

index = global.swaggerIndex;

export { index };

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
    limit
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
