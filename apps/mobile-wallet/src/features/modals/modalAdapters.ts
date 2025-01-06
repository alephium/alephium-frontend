import { createEntityAdapter } from '@reduxjs/toolkit'

import { ModalInstance } from '~/features/modals/modalTypes'

export const modalAdapter = createEntityAdapter<ModalInstance>()
