import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { dAppQuery } from '~/api/queries/dAppQueries'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import { closeModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface VisitDAppButtonProps {
  dAppName: DApp['name']
  parentModalId?: number
}

const VisitDAppButton = ({ dAppName, parentModalId }: VisitDAppButtonProps) => {
  const { data: dApp } = useQuery(dAppQuery(dAppName))
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const dispatch = useAppDispatch()

  if (!dApp) return null

  const handleVisitDApp = () => {
    parentModalId && dispatch(closeModal({ id: parentModalId }))
    navigation.navigate('DAppWebViewScreen', { dAppUrl: dApp.links.website, dAppName: dApp.name })
    sendAnalytics({ event: 'Opened dApp', props: { origin: 'quick_actions', dAppName } })
  }

  return <QuickActionButton title={t('Visit dApp')} onPress={handleVisitDApp} iconProps={{ name: 'arrow-up-right' }} />
}

export default VisitDAppButton
