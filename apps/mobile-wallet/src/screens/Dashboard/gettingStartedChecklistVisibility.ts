interface GettingStartedVisibilityInput {
  isActive: boolean
  isWatchOnly: boolean
  allComplete: boolean
  areBalancesLoading: boolean
}

// While balances load, `receive_funds` reads as undone even for an already-funded wallet, so showing
// the checklist then would flash it and fire a spurious "completed" once the balance resolves. Stay
// hidden until balances are settled.
export const isGettingStartedChecklistVisible = ({
  isActive,
  isWatchOnly,
  allComplete,
  areBalancesLoading
}: GettingStartedVisibilityInput) => isActive && !isWatchOnly && !allComplete && !areBalancesLoading
