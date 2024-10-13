import {getOpenApiSpec} from "@intrig/intrig-openapi3-binding";
import {IntrigConfig, ServerInfo} from "@intrig/cli-common";

export async function getServerInfo(url: string, config: IntrigConfig): Promise<ServerInfo> {
  let document = await getOpenApiSpec(url, config);
  return {
    title: document.info.title,
    serverUrls: document.servers.map(a => a.url)
  }
}
