import { keyring } from '@alephium/keyring'
import { newAddressesSaved, selectAllAddressIndexes } from '@alephium/shared'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { PlusSquare } from 'lucide-react-native'
import { Trans, useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import InfoBox from '~/components/InfoBox'
import { ScreenSection } from '~/components/layout/Screen'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import { getRandomLabelColor } from '~/utils/colors'

interface ConnectDappNewAddressModalContentProps {
  group: AddressGroup
  onDeclinePress: () => void
}

const ConnectDappNewAddressModalContent = ({ group, onDeclinePress }: ConnectDappNewAddressModalContentProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const allAddressesIndexes = useAppSelector(selectAllAddressIndexes)
  const persistAddressSettings = usePersistAddressSettings()

  const handleAddressGeneratePress = async () => {
    dispatch(activateAppLoading(t('Generating new address')))

    try {
      await initializeKeyringWithStoredWallet()
      const newAddress = {
        ...keyring.generateAndCacheAddress({ group, skipAddressIndexes: allAddressesIndexes }),
        label: '',
        color: getRandomLabelColor(),
        isDefault: false
      }

      await persistAddressSettings(newAddress)
      dispatch(newAddressesSaved([newAddress]))

      sendAnalytics({ event: 'WC: Generated new address' })
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'WC: Could not save new address' })
    } finally {
      keyring.clear()
    }

    dispatch(deactivateAppLoading())
  }

  return (
    <>
      <ScreenSection>
        <InfoBox title="New address needed" Icon={PlusSquare}>
          <AppText>
            <Trans t={t} i18nKey="dAppRequiredGroup" values={{ group }} components={{ 1: <AppText color="accent" /> }}>
              {'The dApp asks for an address in group <1>{{ group }}</1>. Click below to generate one!'}
            </Trans>
          </AppText>
        </InfoBox>
      </ScreenSection>
      <ScreenSection centered>
        <ButtonsRow>
          <Button title={t('Decline')} variant="alert" onPress={onDeclinePress} flex />
          <Button title={t('Generate new address')} variant="accent" onPress={handleAddressGeneratePress} flex />
        </ButtonsRow>
      </ScreenSection>
    </>
  )
}

export default ConnectDappNewAddressModalContent
