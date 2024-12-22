import { ReactClientComponentEditor } from '@/components/ReactClientComponentEditor';

export default async function Page() {
  let config = {
    method: 'post',
    variables: [],
    source: 'test-source',
    paths: ['test-controller'],
    operationId: 'testCreate',
    requestUrl: '/test/create',
    sourcePath: 'path/to/source',
    requestBody: 'CreateRequest',
    contentType: 'application/json',
    response: 'TestCreateResponse',
    responseType: 'application/json',
  }

  return <>
    <ReactClientComponentEditor config={config} />
  </>
}
