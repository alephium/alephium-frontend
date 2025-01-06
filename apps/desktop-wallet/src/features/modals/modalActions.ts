import { createAction } from '@reduxjs/toolkit'

import { ModalInstance, OpenModalParams } from '@/features/modals/modalTypes'

export const openModal = createAction<OpenModalParams>('modal/openModal')

export const closeModal = createAction<{ id: ModalInstance['id'] }>('modal/closeModal')
