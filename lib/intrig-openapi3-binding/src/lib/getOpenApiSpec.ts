import {get as httpsGet} from 'https'
import {get as httpGet} from 'http'
import RefParser from '@apidevtools/json-schema-ref-parser'
import {OpenAPIV3_1,} from 'openapi-types'
import {IntrigConfig} from '@intrig/cli-common'

async function fetchSpec(url: string, rejectUnauthorized: boolean): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const get = url.startsWith('https') ? httpsGet : httpGet
    const options = { rejectUnauthorized }

    get(url, options, (response) => {
      if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
        reject(new Error(`HTTP Status Code: ${response.statusCode}`))
        return
      }

      let body = ''
      response.on('data', (chunk) => { body += chunk })
      response.on('end', () => resolve(body))
    }).on('error', (err) => reject(err))
  })
}

export async function getOpenApiSpec(url: string, config: IntrigConfig): Promise<OpenAPIV3_1.Document> {
  try {
    const response = await fetchSpec(url, config.rejectUnauthorized ?? true)
    const parsedResponse = JSON.parse(response)
    return await RefParser.bundle(parsedResponse) as OpenAPIV3_1.Document
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch or parse OpenAPI spec from ${url}: ${error.message}`)
    } else {
      throw new Error(`An unknown error occurred while fetching OpenAPI spec from ${url}`)
    }
  }
}
