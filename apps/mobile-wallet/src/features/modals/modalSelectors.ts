import { modalAdapter } from '~/features/modals/modalAdapters'
import { RootState } from '~/store/store'

export const { selectAll: selectAllModals, selectById: selectModalById } = modalAdapter.getSelectors<RootState>(
  (state) => state.modals
)
