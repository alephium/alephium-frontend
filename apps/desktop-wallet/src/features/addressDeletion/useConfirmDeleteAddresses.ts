import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

interface UseConfirmDeleteAddressesProps {
  confirmationText: string
  onConfirm: () => void
}

const useConfirmDeleteAddresses = ({ confirmationText, onConfirm }: UseConfirmDeleteAddressesProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const confirmDeleteAddresses = () => {
    dispatch(
      openModal({
        name: 'ConfirmModal',
        props: {
          Icon: Trash2,
          onConfirm,
          narrow: true,
          text: confirmationText,
          note: t('Forgetting addresses does not delete your assets in them.')
        }
      })
    )
  }

  return confirmDeleteAddresses
}

export default useConfirmDeleteAddresses
