import * as path from 'path'
import * as fs from 'fs-extra'
import globby from 'globby'

export async function postBuild() {
  const source = path.resolve(process.cwd(), 'node_modules/@intrig/client-next/api');
  const destination = path.resolve(process.cwd(), '.next/server/app/api');

  // Cleanup previously generated files before copying
  const generatedFilesPattern = path.join(destination, '**/*.{js,d.ts}');
  globby(generatedFilesPattern).then((files) => {
    files.forEach((file) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (!err && data.startsWith('// @generated')) {
          fs.remove(file, (removeErr) => {
            if (removeErr) {
              console.error('Error removing generated file:', file, removeErr);
            } else {
              console.log('Removed generated file:', file);
            }
          });
        }
      });
    });
  });

  // Copy new files with @generated comment
  fs.copy(source, destination, { overwrite: false, errorOnExist: false }, (err) => {
    if (err) {
      console.error('Error copying directory:', err);
    } else {
      // Add @generated comment to copied files
      const copiedFilesPattern = path.join(destination, '**/*.{js,d.ts}');
      globby(copiedFilesPattern).then((files) => {
        files.forEach((file) => {
          fs.readFile(file, 'utf8', (readErr, data) => {
            if (!readErr && !data.startsWith('// @generated')) {
              const updatedData = `// @generated\n${data}`;
              fs.writeFile(file, updatedData, 'utf8', (writeErr) => {
                if (writeErr) {
                  console.error('Error adding @generated comment to file:', file, writeErr);
                } else {
                  console.log('Added @generated comment to file:', file);
                }
              });
            }
          });
        });
      });
      console.log('Successfully performed deep merge without overwriting existing files');
    }
  });
}
