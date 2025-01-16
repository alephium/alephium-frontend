import { Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

const AdvancedOperationsButton = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const openAdvancedOperationsSideModal = () => dispatch(openModal({ name: 'AdvancedOperationsSideModal' }))

  return (
    <Button role="secondary" Icon={Wrench} onClick={openAdvancedOperationsSideModal} short>
      {t('Advanced operations')}
    </Button>
  )
}

export default AdvancedOperationsButton
