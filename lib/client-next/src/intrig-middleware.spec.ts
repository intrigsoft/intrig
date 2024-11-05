import { extractPathVariables } from './intrig-middleware';

describe('intrig-middleware', () => {
  it('should extract params', () => {
    let variables = extractPathVariables('/api/v1/database/{dbId}/table/{tableId}', '/api/v1/database/dap/table/users');

    console.log(variables);
  })
})
