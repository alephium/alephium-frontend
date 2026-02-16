import { RootState } from '~/store/store'

export const selectFavoriteDApps = (state: RootState) => state.favoriteDApps.dAppNames
export const selectFavoriteCustomDApps = (state: RootState) => state.favoriteDApps.customDappUrls

export const selectIsDAppFavorite = (state: RootState, dAppName: string) =>
  state.favoriteDApps.dAppNames.includes(dAppName)

export const selectIsCustomDAppFavorite = (state: RootState, dAppUrl: string) =>
  state.favoriteDApps.customDappUrls.includes(dAppUrl)
