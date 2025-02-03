import { PostCompileProps } from '@intrig/cli-common';

export async function postCompile({ tempDir, targetLibDir }: PostCompileProps) {
  // cli.action.start('Copying (generated) files to project directory')
  // try {
  // const generatedSourceDir = path.join(tempDir, 'src', 'api', '(generated)')
  // const generatedTargetDir = path.join(path.join(targetLibDir, ".."), '(generated)')
  // await fs.copy(generatedSourceDir, generatedTargetDir)
  // } catch (e) {
  //   console.error('Failed to copy (generated) files', e)
  // }
  // cli.action.stop()
}
