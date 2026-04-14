import { UnlistedFT } from '@alephium/shared'
import { useMemo } from 'react'

const compareByNameThenId = (a: { name?: string; id: string }, b: { name?: string; id: string }) => {
  const nameA = a.name ?? ''
  const nameB = b.name ?? ''
  if (nameA !== nameB) return nameA < nameB ? -1 : 1
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

export const useSortUnlistedFtsAlphabetically = (unlistedFts: UnlistedFT[]) =>
  useMemo(() => [...unlistedFts].sort(compareByNameThenId), [unlistedFts])
