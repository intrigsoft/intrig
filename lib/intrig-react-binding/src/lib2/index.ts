import {ContentGeneratorAdaptor, IntrigSourceConfig, SourceInfo} from "@intrig/cli-common";
import {generateGlobalContent} from "./generateGlobalContent";
import {generateSourceContent} from "./generateSourceContent";

export const adaptor: ContentGeneratorAdaptor = {
  generateSourceContent,
  generateGlobalContent,
  async postBuild() {
  },
  async predev(): Promise<void> {

  },
  async postCompile() {

  }
}
