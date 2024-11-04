import { ContentGeneratorAdaptor } from '@intrig/cli-common';
import { generateGlobalContent } from './generateGlobalContent';
import { generateSourceContent } from './generateSourceContent';
import { postBuild } from './postBuild';
import { predev } from './predev';

export const adaptor: ContentGeneratorAdaptor = {
  generateSourceContent,
  generateGlobalContent,
  postBuild,
  predev
}
