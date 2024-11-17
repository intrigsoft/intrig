import * as chokidar from 'chokidar';
import path from 'path';
import _ from 'lodash';
import { INTRIG_LOCATION } from '@/const/locations';
import {reindex as flexIndexReload} from './flexIndex'
import {reindex as codeIndexReload} from './codeIndex'

// Extend the NodeJS global type to include generatedContentWatcher
declare global {
  namespace NodeJS {
    interface Global {
      generatedContentWatcher?: chokidar.FSWatcher;
    }
  }
  var generatedContentWatcher: chokidar.FSWatcher
}

if (!global.generatedContentWatcher) {
  const directoryToWatch = path.join(INTRIG_LOCATION, );

  const updateIndexes = _.debounce(() => {
    console.log('Reloading')
    flexIndexReload();
    codeIndexReload();
  }, 1000);

  const watcher = chokidar.watch(directoryToWatch, {
    persistent: true,
    awaitWriteFinish: true,
    interval: 100,
    binaryInterval: 1000

  });

  watcher
    .on('add', (filePath) => {
      updateIndexes();
    })
    .on('change', (filePath) => {
      updateIndexes();
    })
    .on('unlink', (filePath) => {
      updateIndexes();
    });

  global.generatedContentWatcher = watcher;
}

export default global.generatedContentWatcher;
