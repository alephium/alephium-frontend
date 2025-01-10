import { createAction } from '@reduxjs/toolkit'

import { ModalInstance, OpenModalParams } from '~/features/modals/modalTypes'

export const openModal = createAction<OpenModalParams>('modal/openModal')

export const closeModal = createAction<{ id?: ModalInstance['id']; name?: ModalInstance['params']['name'] }>(
  'modal/closeModal'
)

export const removeModal = createAction<{ id: ModalInstance['id'] }>('modal/removeModal')
