import { createAction } from '@reduxjs/toolkit'

import { LoaderConfig } from '~/features/loader/loaderTypes'

export const activateAppLoading = createAction<LoaderConfig | LoaderConfig['text']>('loader/activateAppLoading')

export const deactivateAppLoading = createAction('loader/deactivateAppLoading')
