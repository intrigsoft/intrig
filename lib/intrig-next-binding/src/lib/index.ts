import {ContentGeneratorAdaptor, IntrigSourceConfig, SourceInfo} from "@intrig/cli-common";
import {generateGlobalContent} from "./generateGlobalContent";
import {generateSourceContent} from "./generateSourceContent";
import {postBuild} from './postBuild';

export const adaptor: ContentGeneratorAdaptor = {
  generateSourceContent,
  generateGlobalContent,
  postBuild
}
