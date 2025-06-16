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
import { useModalContext } from '~/features/modals/ModalContext'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { useAppDispatch } from '~/hooks/redux'

interface DAppQuickActionsModalProps {
  dAppName: DApp['name']
}

const DAppQuickActionsModal = memo<DAppQuickActionsModalProps & ModalBaseProp>(({ id, dAppName }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { dismissModal } = useModalContext()

  const handleShowDetails = () => {
    dismissModal()
    dispatch(openModal({ name: 'DAppDetailsModal', props: { dAppName } }))
    sendAnalytics({ event: 'Opened dApp details modal', props: { origin: 'quick_actions' } })
  }

  return (
    <BottomModal2 notScrollable modalId={id} title={<DAppDetailsModalHeader dAppName={dAppName} />} titleAlign="left">
      <QuickActionButtons>
        <QuickActionButton
          title={t('Show details')}
          onPress={handleShowDetails}
          iconProps={{ name: 'more-horizontal' }}
        />
        <VisitDAppButton dAppName={dAppName} onVisitDappButtonPress={dismissModal} buttonType="quickAction" />
        <AddToFavoritesButton dAppName={dAppName} />
      </QuickActionButtons>
    </BottomModal2>
  )
})

export default DAppQuickActionsModal

const AddToFavoritesButton = ({ dAppName }: DAppQuickActionsModalProps) => {
  const { isFavorite, toggleFavorite } = useToggleFavoriteDApp(dAppName)
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <QuickActionButton
      title={isFavorite ? t('Remove from favorites') : t('Add to favorites')}
      onPress={toggleFavorite}
      iconProps={{ name: 'star', color: isFavorite ? theme.font.highlight : theme.font.primary }}
    />
  )
}
