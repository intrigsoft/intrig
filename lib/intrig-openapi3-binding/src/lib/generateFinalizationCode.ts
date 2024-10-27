import {CustomOptions, DefaultContext, OptionFlag} from "@oclif/core/lib/interfaces/parser";
import * as path from 'path'
import {indexTemplate} from "./templates/index.template";
import {dump} from "./util";
import {networkStateTemplate} from "./templates/network-state.template";
import {providerTemplate} from "./templates/provider.template";
import {tsConfigTemplate} from "./templates/tsconfig.template";
import {packageJsonTemplate} from "./templates/packageJson.template";

export async function generateFinalizationCode(env: string | ((context: DefaultContext<CustomOptions & OptionFlag<string, CustomOptions>>) => Promise<string | undefined>),
                                         force: boolean,
                                         path: string) {
  dump(networkStateTemplate(path))
  dump(providerTemplate(path))
  dump(indexTemplate(path))
  dump(tsConfigTemplate(path))
  dump(packageJsonTemplate(path))
}
