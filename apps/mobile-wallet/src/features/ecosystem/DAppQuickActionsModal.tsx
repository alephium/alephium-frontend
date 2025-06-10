import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import QuickActionButtons from '~/components/buttons/QuickActionButtons'
import DAppDetailsModalHeader from '~/features/ecosystem/DAppDetailsModalHeader'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import useToggleFavoriteDApp from '~/features/ecosystem/favoriteDApps/useToggleFavoriteDApp'
import VisitDAppButton from '~/features/ecosystem/VisitDAppButton'
import BottomModal2 from '~/features/modals/BottomModal2'
import { openModal } from '~/features/modals/modalActions'
import { ModalBaseProp, ModalInstance } from '~/features/modals/modalTypes'
import { useAppDispatch } from '~/hooks/redux'

interface DAppQuickActionsModalProps {
  dAppName: DApp['name']
}

const DAppQuickActionsModal = memo<DAppQuickActionsModalProps & ModalBaseProp>(({ id, dAppName }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { dismiss } = useBottomSheetModal()

  const handleShowDetails = () => {
    dismiss(id)
    dispatch(openModal({ name: 'DAppDetailsModal', props: { dAppName } }))
    sendAnalytics({ event: 'Opened dApp details modal', props: { origin: 'quick_actions' } })
  }

  return (
    <BottomModal2 notScrollable modalId={id} title={<DAppDetailsModalHeader dAppName={dAppName} />} titleAlign="left">
      <QuickActionButtons>
        <QuickActionButton
          title={t('Show details')}
          onPress={handleShowDetails}
          iconProps={{ name: 'ellipsis-horizontal' }}
        />
        <VisitDAppButton dAppName={dAppName} parentModalId={id} buttonType="quickAction" />
        <AddToFavoritesButton dAppName={dAppName} parentModalId={id} />
      </QuickActionButtons>
    </BottomModal2>
  )
})

export default DAppQuickActionsModal

interface QuickActionButtonProps extends DAppQuickActionsModalProps {
  parentModalId: ModalInstance['id']
}

const AddToFavoritesButton = ({ dAppName }: QuickActionButtonProps) => {
  const { isFavorite, toggleFavorite } = useToggleFavoriteDApp(dAppName)
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <QuickActionButton
      title={isFavorite ? t('Remove from favorites') : t('Add to favorites')}
      onPress={toggleFavorite}
      iconProps={{ name: 'heart', color: isFavorite ? theme.global.alert : theme.font.primary }}
    />
  )
}
