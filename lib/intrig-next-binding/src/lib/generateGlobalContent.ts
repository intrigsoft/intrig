import {dump} from "@intrig/cli-common";
import {networkStateTemplate} from "./templates/network-state.template";
import {providerTemplate} from "./templates/provider.template";
import {indexTemplate} from "./templates/index.template";
import {loggerTemplate} from "./templates/logger.template";
import {tsConfigTemplate} from "./templates/tsconfig.template";
import {packageJsonTemplate} from "./templates/packageJson.template";
import {mediaTypeUtilsTemplate} from "./templates/media-type-utils.template";
import { intrigMiddlewareTemplate } from './templates/intrigMiddleware.template';
import { contextTemplate } from './templates/context.template';
import { extraTemplate } from './templates/extra.template';
import { intrigLayoutTemplate } from './templates/intrig-layout.template';

export async function generateGlobalContent(path: string) {
  await dump(networkStateTemplate(path))
  await dump(providerTemplate(path))
  await dump(intrigLayoutTemplate(path))
  await dump(indexTemplate(path))
  await dump(tsConfigTemplate(path))
  await dump(packageJsonTemplate(path))
  await dump(mediaTypeUtilsTemplate(path))
  await dump(intrigMiddlewareTemplate(path))
  await dump(contextTemplate(path))
  await dump(extraTemplate(path))
  await dump(loggerTemplate(path))
}
