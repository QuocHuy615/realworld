// Run the real API against an isolated in-memory SQLite database.
process.env.NODE_ENV = 'test'
const { spawn } = require('child_process')
const { start } = require('../app')

let exitCode = 1
start(0, false, async (server) => {
  try {
    exitCode = await new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        [
          require.resolve('jest/bin/jest'),
          '--testPathPattern=tests/api',
          '--runInBand',
        ],
        {
          stdio: 'inherit',
          env: {
            ...process.env,
            API_URL: `http://127.0.0.1:${server.address().port}`,
            JEST_JUNIT_OUTPUT_NAME: 'jest-api.xml',
          },
        }
      )
      child.once('error', reject)
      child.once('exit', (code) => resolve(code === null ? 1 : code))
    })
  } finally {
    server.close()
  }
})
  .then(() => {
    process.exitCode = exitCode
  })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
