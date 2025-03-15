import { getOpenApiSpec } from './getOpenApiSpec';
import {IntrigConfig, ServerInfo} from "@intrig/cli-common";

export async function getServerInfo(url: string, config: IntrigConfig): Promise<ServerInfo> {
  const document = await getOpenApiSpec(url, config);
  return {
    title: document.info.title,
    serverUrls: document.servers.map(a => a.url)
  }
}
