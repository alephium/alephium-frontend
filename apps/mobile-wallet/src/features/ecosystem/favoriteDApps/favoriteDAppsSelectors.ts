import { RootState } from '~/store/store'

export const selectFavoriteDApps = (state: RootState) => state.favoriteDApps.dAppNames

export const selectIsDAppFavorite = (state: RootState, dAppName: string) =>
  state.favoriteDApps.dAppNames.includes(dAppName)
