import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { BranchCommits } from '../types'

const info = atom({ plugin: 'pr-commits', key: 'info' } as const, null)
const isHidden = atom({ plugin: 'pr-commits', key: 'isHidden' } as const, false)

const MAX_SHOWN = 5
const POLL_MS = 10_000

async function refresh($: EngineInterface) {
  const git = async (...args: string[]) => {
    const r = await $.process.run(['git', ...args])
    return r.exitCode === 0 ? r.stdout.trim() : null
  }

  const branch = await git('rev-parse', '--abbrev-ref', 'HEAD')
  let next: BranchCommits | null = null

  if (branch && branch !== 'HEAD') {
    for (const base of ['origin/main', 'origin/master', 'main', 'master']) {
      if (branch === base || (await git('rev-parse', '--verify', '--quiet', base)) === null) continue
      const log = await git('log', '--format=%h %s', `${base}..HEAD`)
      next = { branch, base, commits: log ? log.split('\n') : [] }
      break
    }
  }

  await update($, info, () => next)
}

export const register: Register = on => {
  let isPolling = false

  on('session.start', async ($, e, next) => {
    await refresh($)

    if (!isPolling) {
      isPolling = true
      $.clock.every(POLL_MS, () => refresh($))
    }

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await refresh($)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const data = await read($, info)

    if (e.props.hasSurvey || !data || data.commits.length === 0 || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)
    const shown = data.commits.slice(0, MAX_SHOWN)
    const more = data.commits.length - shown.length

    return (
      <Box flexDirection="column">
        <Box>
          <Text bold>
            {data.branch}: {data.commits.length} commit{data.commits.length === 1 ? '' : 's'} ahead of {data.base}{' '}
          </Text>
          <Button key="hide" label="Hide" onPress={() => update($, isHidden, () => true)} />
        </Box>
        {shown.map((c, i) => (
          <Text key={String(i)} dimColor>
            {'  '}
            {c}
          </Text>
        ))}
        {more > 0 ? <Text dimColor>{'  '}…and {more} more</Text> : null}
      </Box>
    )
  })
}
