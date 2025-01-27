import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import QuickActionButtons from '~/components/buttons/QuickActionButtons'
import DAppDetailsModalHeader from '~/features/ecosystem/DAppDetailsModalHeader'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import useToggleFavoriteDApp from '~/features/ecosystem/favoriteDApps/useToggleFavoriteDApp'
import VisitDAppButton from '~/features/ecosystem/VisitDAppButton'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal, openModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'

interface DAppQuickActionsModalProps {
  dAppName: DApp['name']
}

const DAppQuickActionsModal = withModal<DAppQuickActionsModalProps>(({ id, dAppName }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleShowDetails = () => {
    dispatch(closeModal({ id }))
    dispatch(openModal({ name: 'DAppDetailsModal', props: { dAppName } }))
    sendAnalytics({ event: 'Opened dApp details modal', props: { origin: 'quick_actions' } })
  }

  return (
    <BottomModal modalId={id} title={<DAppDetailsModalHeader dAppName={dAppName} />} titleAlign="left">
      <QuickActionButtons>
        <QuickActionButton
          title={t('Show details')}
          onPress={handleShowDetails}
          iconProps={{ name: 'more-horizontal' }}
        />
        <VisitDAppButton dAppName={dAppName} parentModalId={id} />
        <AddToFavoritesButton dAppName={dAppName} parentModalId={id} />
      </QuickActionButtons>
    </BottomModal>
  )
})

export default DAppQuickActionsModal

interface QuickActionButtonProps extends DAppQuickActionsModalProps {
  parentModalId: number
}

const AddToFavoritesButton = ({ dAppName }: QuickActionButtonProps) => {
  const { isFavorite, toggleFavorite } = useToggleFavoriteDApp(dAppName)
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <QuickActionButton
      title={isFavorite ? t('Remove from favorites') : t('Add to favorites')}
      onPress={toggleFavorite}
      iconProps={{ name: 'star', color: isFavorite ? theme.font.highlight : undefined }}
    />
  )
}
