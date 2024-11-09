import { getRoot } from '../services/getRoot';

export const dynamic = 'force-dynamic';

export default async function Index() {

  const dirPath = await getRoot()

  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.css file.
   */
  return (
    <>
      {dirPath}
    </>
  );
}
