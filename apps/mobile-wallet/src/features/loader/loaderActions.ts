import { createAction } from '@reduxjs/toolkit'

export const activateAppLoading = createAction<string>('loader/activateAppLoading')

export const deactivateAppLoading = createAction('loader/deactivateAppLoading')
