import {dump, IntrigSourceConfig} from "@intrig/cli-common";
import {networkStateTemplate} from "./templates/network-state.template";
import {providerTemplate} from "./templates/provider.template";
import {indexTemplate} from "./templates/index.template";
import {tsConfigTemplate} from "./templates/tsconfig.template";
import {packageJsonTemplate} from "./templates/packageJson.template";
import {mediaTypeUtilsTemplate} from "./templates/media-type-utils.template";
import { contextTemplate } from './templates/context.template';
import { extraTemplate } from './templates/extra.template';
import { loggerTemplate } from './templates/logger.template';

export function generateGlobalContent(path: string, apisToSync: IntrigSourceConfig[]) {
  dump(networkStateTemplate(path))
  dump(providerTemplate(path, apisToSync))
  dump(indexTemplate(path))
  dump(tsConfigTemplate(path))
  dump(packageJsonTemplate(path))
  dump(mediaTypeUtilsTemplate(path))
  dump(contextTemplate(path, apisToSync))
  dump(extraTemplate(path, apisToSync))
  dump(loggerTemplate(path))
}
