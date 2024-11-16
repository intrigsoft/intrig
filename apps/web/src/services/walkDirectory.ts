import * as fs from 'fs';
import * as path from 'path';

export function walkDirectory(directoryPath: string, callback: (filePath: string, stats: fs.Stats) => void) {
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
