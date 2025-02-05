import { createAction } from '@reduxjs/toolkit'

import { ModalInstance, OpenModalParams } from '~/features/modals/modalTypes'

export const openModal = createAction<OpenModalParams>('modal/openModal')

export const closeModal = createAction<{ id: ModalInstance['id'] }>('modal/closeModal')

export const closeAllModals = createAction('modal/closeAllModals')

export const removeModal = createAction<{ id: ModalInstance['id'] }>('modal/removeModal')
