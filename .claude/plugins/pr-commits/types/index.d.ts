export type BranchCommits = { branch: string; base: string; commits: string[] }

declare module 'claude-code' {
  interface PluginState {
    'pr-commits': { info: BranchCommits | null; isHidden: boolean }
  }
}
