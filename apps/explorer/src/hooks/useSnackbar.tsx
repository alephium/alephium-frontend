import { useContext } from 'react'

import { SnackbarContext } from '@/components/Snackbar/SnackbarProvider'

export const useSnackbar = () => useContext(SnackbarContext)
