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
  const directoryToWatch = path.join(INTRIG_LOCATION, "generated", "src", "**", "registry.json");

  const updateIndexes = _.debounce(() => {
    flexIndexReload();
    codeIndexReload();
  }, 1000, { leading: false, trailing: true});

  const watcher: any = chokidar.watch(directoryToWatch, {
    persistent: true,
    awaitWriteFinish: true,
    interval: 1000,
    binaryInterval: 1000,
  });

  console.log(watcher)

  watcher
    .on('add', () => {
      updateIndexes();
    })
    .on('change', () => {
      updateIndexes();
    })
    .on('unlink', () => {
      updateIndexes();
    });

  global.generatedContentWatcher = watcher;
}

export default global.generatedContentWatcher;
