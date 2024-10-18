#!/usr/bin/env node

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  await import('../main.js')
  const oclif = await import('@oclif/core')
  await oclif.execute({dir: __dirname})
})()
