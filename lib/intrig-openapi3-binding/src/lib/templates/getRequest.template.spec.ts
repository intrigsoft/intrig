import {getRequestTemplate} from "./getRequest.template";

describe("getRequest.template", () => {
  it('should generate correct code', () => {
    let template = getRequestTemplate({
      source: "petstore",
      requestUrl: "/pet/{petId}",
      paths: ["pet"],
      operationId: "getPetById",
      responseType: "Pet",
      variables: [
        {
          name: 'petId',
          in: 'path',
          ref: '#/components/schemas/GetPetById_PetId'
        }
      ],
      sourcePath: ""
    });

    console.log(template.content);
  });
})
