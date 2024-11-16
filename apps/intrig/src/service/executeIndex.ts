import * as fs from 'fs';
import * as path from 'path';
import Markdoc from '@markdoc/markdoc';
import yaml from 'yaml';

export function executeIndex(_path: string) {
  let contents: Record<string, any> = {};

  walkDirectory(_path, (filePath, stats) => {
    if (stats.isFile()) {
      switch (path.extname(filePath)) {
        case '.ts':
          break;
        case '.md':
          let content = fs.readFileSync(filePath, 'utf8');
          let ast = Markdoc.parse(content);
          let tags: string[];
          if (ast.attributes.frontmatter) {
            let frontmatter = yaml.parse(ast.attributes.frontmatter);
            console.log(frontmatter);
            tags = frontmatter['tags'];
            console.log(frontmatter);
          }
          let transformed = Markdoc.transform(ast);
          let data = Markdoc.renderers.html(transformed);
          contents[path.relative(_path, filePath)] = {
            tags,
            data,
          };
          break;
      }
    }
  });

  console.log(contents);
}

// Function to recursively walk through a directory
function walkDirectory(directoryPath: string, callback: (filePath: string, stats: fs.Stats) => void) {
  // Read the contents of the directory
  const files = fs.readdirSync(directoryPath);

  // Iterate through each file/directory in the current directory
  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);

    // Get information about the file/directory
    const stats = fs.statSync(filePath);

    // If it's a directory, recurse into it
    if (stats.isDirectory()) {
      callback(filePath, stats);
      walkDirectory(filePath, callback);
    } else {
      // If it's a file, just call the callback
      callback(filePath, stats);
    }
  });
}
