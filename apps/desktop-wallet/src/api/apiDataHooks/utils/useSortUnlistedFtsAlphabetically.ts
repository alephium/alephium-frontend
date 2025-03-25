import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { UnlistedFT } from '@/types/tokens'

const useSortUnlistedFtsAlphabetically = (unlistedFts: UnlistedFT[]) =>
  useMemo(() => orderBy(unlistedFts, ['name', 'id'], ['asc', 'asc']), [unlistedFts])

export default useSortUnlistedFtsAlphabetically
