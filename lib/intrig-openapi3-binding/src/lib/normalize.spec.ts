import {normalize} from "./normalize";
import {OpenAPIV3_1} from "openapi-types";

const schema: OpenAPIV3_1.Document = {
  "openapi": "3.1.0",
  "info": {
    "title": "Sample API with References",
    "version": "1.0.0"
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string",
            "format": "email"
          }
        },
        "required": ["id", "name", "email"]
      },
      "Error": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer"
          },
          "message": {
            "type": "string"
          }
        },
        "required": ["code", "message"]
      }
    },
    "parameters": {
      "limitParam": {
        "name": "limit",
        "in": "query",
        "schema": {
          "type": "integer"
        }
      }
    },
    "requestBodies": {
      "userBody": {
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/User"
            }
          }
        }
      }
    },
    "responses": {
      "NotFound": {
        "description": "Resource not found",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/Error"
            }
          }
        }
      }
    },
    "examples": {
      "user": {
        "value": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    },
    "headers": {
      "X-Rate-Limit": {
        "schema": {
          "type": "integer"
        }
      }
    },
    "callbacks": {
      "myCallback": {
        "{$request.body#/callbackUrl}": {
          "post": {
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "Callback successfully processed",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "links": {
      "UserLink": {
        "operationId": "getUser",
        "parameters": {
          "userId": "$response.body#/id"
        }
      }
    }
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "List users",
        "parameters": [
          {
            "$ref": "#/components/parameters/limitParam"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/User"
                  }
                },
                "examples": {
                  "list": {
                    "$ref": "#/components/examples/user"
                  }
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      },
      "post": {
        "summary": "Create a user",
        "requestBody": {
          "$ref": "#/components/requestBodies/userBody"
        },
        "responses": {
          "201": {
            "description": "User created",
            "headers": {
              "X-Rate-Limit": {
                "$ref": "#/components/headers/X-Rate-Limit"
              }
            },
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            },
            "links": {
              "GetUserById": {
                "$ref": "#/components/links/UserLink"
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        },
        "callbacks": {
          "userCreated": {
            "$ref": "#/components/callbacks/myCallback"
          }
        }
      }
    }
  }
}

describe('normalize', () => {
  it('should normalize properly', () => {
    let data = normalize(schema);
    console.log(data);
  });
})
