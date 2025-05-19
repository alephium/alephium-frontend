import { UnlistedFT } from '@alephium/shared'
import { orderBy } from 'lodash'
import { useMemo } from 'react'

export const useSortUnlistedFtsAlphabetically = (unlistedFts: UnlistedFT[]) =>
  useMemo(() => orderBy(unlistedFts, ['name', 'id'], ['asc', 'asc']), [unlistedFts])
