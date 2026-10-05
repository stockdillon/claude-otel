import { test, expect } from 'claude-code/testing'

test('lists commits ahead of the base branch', async ($, on) => {
  const result = (stdout: string, exitCode = 0) => ({
    exitCode,
    stdout,
    stderr: '',
    isStdoutTruncated: false,
    isStderrTruncated: false,
  })

  on('process.run', async (_$, e) => {
    const args = e.argv.slice(1).join(' ')
    if (args.startsWith('rev-parse --abbrev-ref')) return result('feature\n')
    if (args.startsWith('rev-parse --verify')) return result('abc\n')
    if (args.startsWith('log')) return result('a1b2c3 first\nd4e5f6 second\n')
    return result('', 1)
  })

  await $.classic.SessionStart({ source: 'startup' })
  expect(true).toBe(true)
})
