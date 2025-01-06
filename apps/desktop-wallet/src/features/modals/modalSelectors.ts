import { createSelector } from '@reduxjs/toolkit'

import { modalAdapter } from '@/features/modals/modalAdapters'
import { RootState } from '@/storage/store'

export const { selectAll: selectAllModals } = modalAdapter.getSelectors<RootState>((state) => state.modals)

export const selectTopModal = createSelector(selectAllModals, (allModals) => allModals[allModals.length - 1])
