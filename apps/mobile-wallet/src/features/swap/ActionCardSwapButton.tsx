import { AnalyticsEvent, networkSettingsPresets } from '@alephium/shared'
import { NetworkNames, TokenId } from '@alephium/shared/types'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface ActionCardSwapButtonProps {
  origin: 'dashboard' | 'token_details'
  tokenId?: TokenId
  onPress?: () => void
}

const ActionCardSwapButton = ({ origin, tokenId, onPress }: ActionCardSwapButtonProps) => {
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const network = useCurrentlyOnlineNetworkId()

  // Powfi's swap contracts are only deployed on testnet for now.
  if (network !== networkSettingsPresets[NetworkNames.testnet].networkId) return null

  const handleSwapPress = () => {
    sendAnalytics({ event: AnalyticsEvent.ACTION_CARD_PRESSED_BTN_TO_SWAP, props: { origin, provider: 'Powfi' } })

    navigation.navigate('SwapScreen', { initialFromTokenId: tokenId })

    onPress?.()
  }

  return <ActionCardButton title={t('Swap')} onPress={handleSwapPress} iconProps={{ name: 'swap-horizontal' }} />
}

export default ActionCardSwapButton
