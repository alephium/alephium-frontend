import { RootState } from '~/store/store'

export const selectHiddenAssetsIds = (state: RootState) => state.hiddenAssets.hiddenAssetsIds
