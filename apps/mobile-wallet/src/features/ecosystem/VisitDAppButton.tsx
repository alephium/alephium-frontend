import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { dAppQuery } from '~/api/queries/dAppQueries'
import Button, { ButtonProps } from '~/components/buttons/Button'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import { ModalInstance } from '~/features/modals/modalTypes'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface VisitDAppButtonProps extends ButtonProps {
  dAppName: DApp['name']
  parentModalId: ModalInstance['id']
  buttonType: 'quickAction' | 'default'
}

const VisitDAppButton = ({ dAppName, parentModalId, buttonType, ...props }: VisitDAppButtonProps) => {
  const { data: dApp } = useQuery(dAppQuery(dAppName))
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { dismiss } = useBottomSheetModal()

  if (!dApp) return null

  const handleVisitDApp = () => {
    dismiss(parentModalId)
    navigation.navigate('DAppWebViewScreen', { dAppUrl: dApp.links.website, dAppName: dApp.name })
    sendAnalytics({ event: 'Opened dApp', props: { origin: 'quick_actions', dAppName } })
  }

  const ButtonComponent = buttonType === 'default' ? Button : QuickActionButton

  return (
    <ButtonComponent
      title={t('Visit dApp')}
      onPress={handleVisitDApp}
      iconProps={{ name: 'arrow-up-right' }}
      {...props}
    />
  )
}

export default VisitDAppButton
