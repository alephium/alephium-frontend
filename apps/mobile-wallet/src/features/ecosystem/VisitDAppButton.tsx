import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { dAppQuery } from '~/api/queries/dAppQueries'
import Button, { ButtonProps } from '~/components/buttons/Button'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface VisitDAppButtonProps extends ButtonProps {
  dAppName: DApp['name']
  onVisitDappButtonPress: () => void
  buttonType: 'quickAction' | 'default'
}

const VisitDAppButton = ({ dAppName, onVisitDappButtonPress, buttonType, ...props }: VisitDAppButtonProps) => {
  const { data: dApp } = useQuery(dAppQuery(dAppName))
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  if (!dApp) return null

  const handleVisitDApp = () => {
    onVisitDappButtonPress()
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
