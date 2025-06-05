import { NetworkName } from '@alephium/shared'
import { AlertTriangle } from 'lucide-react-native'
import { Trans, useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import InfoBox from '~/components/InfoBox'
import { ScreenSection } from '~/components/layout/Screen'

interface ConnectDappModalSwitchNetworkProps {
  currentNetworkName: NetworkName
  requiredNetworkName: NetworkName
  onSwitchNetworkPress: () => void
  onDeclinePress: () => void
}

const ConnectDappModalSwitchNetwork = ({
  currentNetworkName,
  requiredNetworkName,
  onSwitchNetworkPress,
  onDeclinePress
}: ConnectDappModalSwitchNetworkProps) => {
  const { t } = useTranslation()

  return (
    <>
      <ScreenSection>
        <InfoBox title={t('Switch network')} Icon={AlertTriangle}>
          <AppText>
            <Trans
              t={t}
              i18nKey="dAppRequiredNetwork"
              values={{
                currentNetwork: currentNetworkName,
                requiredNetwork: requiredNetworkName
              }}
              components={{ 1: <AppText color="accent" /> }}
            >
              {
                'You are currently connected to <1>{{ currentNetwork }}</1>, but the dApp requires a connection to <1>{{ requiredNetwork }}</1>.'
              }
            </Trans>
          </AppText>
        </InfoBox>
      </ScreenSection>
      <ScreenSection centered>
        <ButtonsRow>
          <Button title={t('Decline')} variant="alert" onPress={onDeclinePress} flex />
          <Button title={t('Switch network')} variant="accent" onPress={onSwitchNetworkPress} flex />
        </ButtonsRow>
      </ScreenSection>
    </>
  )
}

export default ConnectDappModalSwitchNetwork
