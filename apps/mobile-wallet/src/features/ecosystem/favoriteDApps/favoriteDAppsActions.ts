import { createAction } from '@reduxjs/toolkit'

export const setFavoriteDApps = createAction<string[]>('favoriteDApps/set')
export const addFavoriteDApp = createAction<string>('favoriteDApps/add')
export const removeFavoriteDApp = createAction<string>('favoriteDApps/remove')
export const addFavoriteCustomDApp = createAction<string>('favoriteDApps/addCustom')
export const removeFavoriteCustomDApp = createAction<string>('favoriteDApps/removeCustom')
export const loadFavoriteDApps = createAction<string[]>('favoriteDApps/load')
export const favoriteDAppsLoadedFromStorage = createAction<string[]>('favoriteDApps/loadedFromStorage')
export const favoriteCustomDAppsLoadedFromStorage = createAction<string[]>(
  'favoriteDApps/customFavDappsLoadedFromStorage'
)
