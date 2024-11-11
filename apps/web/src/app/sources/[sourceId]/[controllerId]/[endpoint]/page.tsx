import * as fs from 'fs'
import * as path from 'path'
import { Documentation } from '@/components/Documentation';

export const dynamic = 'force-dynamic';

export default async function Index() {

  let filePath = path.resolve(process.cwd(), 'src/docs/endpoint.md');

  let json = {
    "id": "getPetById",
    "description": "Returns a single pet",
    "summary": "Find pet by ID",
    "method": "get",
    "requestUrl": "/pet/{petId}",
    "endpoints": [
      {
        "source": "petstore",
        "paths": ["pet"],
        "variables": [
          {
            "name": "petId",
            "in": "path",
            "ref": "#/components/schemas/Pet$GetPetById$PetId"
          }
        ],
        "requestUrl": "/pet/{petId}",
        "operationId": "getPetById",
        "sourcePath": "",
        "method": "get",
        "description": "Returns a single pet",
        "summary": "Find pet by ID",
        "responseType": "Pet",
        "responseMediaType": "application/xml",
        "responseExamples": {}
      },
      {
        "source": "petstore",
        "paths": ["pet"],
        "variables": [
          {
            "name": "petId",
            "in": "path",
            "ref": "#/components/schemas/Pet$GetPetById$PetId"
          }
        ],
        "requestUrl": "/pet/{petId}",
        "operationId": "getPetById",
        "sourcePath": "",
        "method": "get",
        "description": "Returns a single pet",
        "summary": "Find pet by ID",
        "responseType": "Pet",
        "responseMediaType": "application/json",
        "responseExamples": {}
      }
    ]
  }


  return (
    <>
      <Documentation filePath={filePath} variables={json} />
    </>
  );
}
