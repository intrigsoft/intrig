import * as fs from 'fs'
import * as path from 'path'
import { Documentation } from '@/components/Documentation';

export const dynamic = 'force-dynamic';

export default async function Index() {

  let filePath = path.resolve(process.cwd(), 'src/docs/source.md');

  let json = {
    "id": "petstore",
    "info": {
      "title": "Swagger Petstore - OpenAPI 3.0",
      "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about\nSwagger at [http://swagger.io](http://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!\nYou can now help us improve the API whether it's by making changes to the definition itself or to the code.\nThat way, with time, we can improve the API in general, and expose some of the new features in OAS3.\n\nSome useful links:\n- [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)\n- [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
      "termsOfService": "http://swagger.io/terms/",
      "contact": { "email": "apiteam@swagger.io" },
      "license": {
        "name": "Apache 2.0",
        "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
      },
      "version": "1.0.19"
    },
    "servers": [{ "url": "/api/v3" }],
    "externalDocs": {
      "description": "Find out more about Swagger",
      "url": "http://swagger.io"
    }
  }


  return (
    <>
      <Documentation filePath={filePath} variables={json} />
    </>
  );
}
