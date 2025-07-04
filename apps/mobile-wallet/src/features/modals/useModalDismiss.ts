import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { useCallback, useRef } from 'react'

import { closeModal, removeModal } from '~/features/modals/modalActions'
import { ModalInstance } from '~/features/modals/modalTypes'
import { useAppDispatch } from '~/hooks/redux'

export interface UseModalDismissProps {
  id: ModalInstance['id']
  onUserDismiss?: () => void
}

const useModalDismiss = ({ id, onUserDismiss }: UseModalDismissProps) => {
  const dispatch = useAppDispatch()
  const { dismiss, dismissAll } = useBottomSheetModal()

  const wasDismissedProgrammatically = useRef(false)

  const dismissModal = useCallback(() => {
    wasDismissedProgrammatically.current = true
    dismiss(id)
  }, [dismiss, id])

  const onDismiss = () => {
    if (!wasDismissedProgrammatically.current) {
      onUserDismiss?.()
    }

    dispatch(closeModal({ id }))
    dispatch(removeModal({ id }))
  }

  return { dismissModal, onDismiss, dismissAll }
}

export default useModalDismiss
