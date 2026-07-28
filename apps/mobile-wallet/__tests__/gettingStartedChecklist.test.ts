import { describe, expect, it } from 'vitest'

import { isGettingStartedChecklistVisible } from '~/screens/Dashboard/gettingStartedChecklistVisibility'

const visibility = (overrides: Partial<Parameters<typeof isGettingStartedChecklistVisible>[0]> = {}) =>
  isGettingStartedChecklistVisible({
    isActive: true,
    isWatchOnly: false,
    allComplete: false,
    areBalancesLoading: false,
    ...overrides
  })

describe(isGettingStartedChecklistVisible, () => {
  // An imported, already-funded wallet whose balances are still loading must not surface the checklist:
  // `receive_funds` reads as undone mid-load, so it would flash and fire a spurious "Getting Started
  // Completed" the moment the balance resolves, with no user action.
  it('stays hidden while balances are loading', () => {
    expect(visibility({ areBalancesLoading: true })).toBe(false)
  })

  it('shows once balances have loaded and something is still left to do', () => {
    expect(visibility()).toBe(true)
  })

  it('hides when every item is complete', () => {
    expect(visibility({ allComplete: true })).toBe(false)
  })

  it('never shows for a watch-only wallet', () => {
    expect(visibility({ isWatchOnly: true })).toBe(false)
  })

  it('stays hidden while inactive', () => {
    expect(visibility({ isActive: false })).toBe(false)
  })
})
