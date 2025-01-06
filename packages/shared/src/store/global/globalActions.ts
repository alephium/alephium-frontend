import { createAction } from '@reduxjs/toolkit'

export const appReset = createAction('global/appReset')

export const appBecameInactive = createAction('global/appBecameInactive')
