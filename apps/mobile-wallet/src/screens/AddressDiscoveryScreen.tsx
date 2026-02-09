import { addressesImported, AddressHash } from '@alephium/shared'
import { useUnsortedAddressesHashes } from '@alephium/shared-react'
import { StackScreenProps } from '@react-navigation/stack'
import Checkbox from 'expo-checkbox'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBox from '~/components/AddressBox'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { openModal } from '~/features/modals/modalActions'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { addressDiscoveryStopped, discoverAddresses, selectAllDiscoveredAddresses } from '~/store/addressDiscoverySlice'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { getRandomLabelColor } from '~/utils/colors'
import { resetNavigation } from '~/utils/navigation'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'AddressDiscoveryScreen'>, ScrollScreenProps {}

const AddressDiscoveryScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const discoveredAddresses = useAppSelector(selectAllDiscoveredAddresses)
  const { loading, status, progress } = useAppSelector((s) => s.addressDiscovery)
  const networkName = useAppSelector((s) => s.network.name)
  const persistAddressSettings = usePersistAddressSettings()
  const { t } = useTranslation()

  const [addressSelections, setAddressSelections] = useState<Record<AddressHash, boolean>>({})
  const [importLoading, setImportLoading] = useState(false)

  const isImporting = params?.isImporting
  const selectedAddressesToImport = discoveredAddresses.filter(({ hash }) => addressSelections[hash])

  const startScan = useCallback(() => dispatch(discoverAddresses()), [dispatch])

  const stopScan = () => dispatch(addressDiscoveryStopped())

  const continueToNextScreen = () =>
    isImporting ? resetNavigation(navigation, 'NewWalletSuccessScreen') : navigation.goBack()

  const importAddresses = async () => {
    setImportLoading(true)
    dispatch(activateAppLoading(t('Importing addresses')))

    const newAddresses = selectedAddressesToImport.map(({ balance, ...address }) => ({
      ...address,
      isDefault: false,
      color: getRandomLabelColor()
    }))

    try {
      await persistAddressSettings(newAddresses)
      dispatch(addressesImported(newAddresses))

      sendAnalytics({ event: 'Imported discovered addresses' })
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Could not import addresses from address discovery' })
    }

    continueToNextScreen()

    dispatch(deactivateAppLoading())
    setImportLoading(false)
  }

  const toggleAddressSelection = (hash: AddressHash) => {
    if (loading) return

    setAddressSelections({
      ...addressSelections,
      [hash]: !addressSelections[hash]
    })
  }

  useEffect(() => {
    if (params?.startScanning) {
      startScan()
    }
  }, [params?.startScanning, startScan])

  useEffect(() => {
    setAddressSelections((prevSelections) => {
      const newSelections = { ...prevSelections }

      discoveredAddresses.forEach(({ hash }) => {
        if (newSelections[hash] === undefined) {
          newSelections[hash] = true
        }
      })
      return newSelections
    })
  }, [discoveredAddresses])

  const handleStartScanPress = () => {
    sendAnalytics({ event: 'Started address discovery from settings' })

    startScan()
  }

  const handleStopScanPress = () => {
    sendAnalytics({ event: 'Stopped address discovery' })

    stopScan()
  }

  const handleContinueScanPress = () => {
    sendAnalytics({ event: 'Continued address discovery' })

    startScan()
  }

  return (
    <ScrollScreen
      verticalGap
      fill
      contentPaddingTop
      screenTitle={t('Active addresses')}
      screenIntro={t(
        'Scan the blockchain to find your active addresses on the {{ networkName }} network. This process might take a while.',
        { networkName }
      )}
      headerOptions={{ type: 'stack' }}
      {...props}
    >
      <ScreenSection fill>
        <CurrentAddresses />

        {(loading || status === 'finished' || discoveredAddresses.length > 0) && !importLoading && (
          <>
            <ScreenSectionTitle style={{ marginTop: VERTICAL_GAP }}>
              {t('Newly discovered addresses')}
            </ScreenSectionTitle>
            {loading && (
              <ScanningIndication>
                <Row transparent style={{ marginBottom: 10 }} isLast>
                  <ActivityIndicator size="small" color={theme.font.tertiary} style={{ marginRight: 10 }} />
                  <AppText color="secondary">{t('Scanning')}...</AppText>
                </Row>
                <ProgressBar progress={progress} color={theme.global.accent} />
              </ScanningIndication>
            )}

            {discoveredAddresses.length > 0 && (
              <Surface>
                {discoveredAddresses.map(({ hash, balance }, index) => (
                  <Row
                    key={hash}
                    title={hash}
                    truncate
                    onPress={() => toggleAddressSelection(hash)}
                    isLast={index === discoveredAddresses.length - 1}
                  >
                    <AmountContent>
                      <AmountStyled value={BigInt(balance)} color="secondary" />
                      <Checkbox
                        value={addressSelections[hash]}
                        disabled={loading}
                        onValueChange={() => toggleAddressSelection(hash)}
                        style={{ borderRadius: 5 }}
                      />
                    </AmountContent>
                  </Row>
                ))}
              </Surface>
            )}
            {discoveredAddresses.length === 0 && status === 'finished' && (
              <AppText>{t('Did not find any new addresses, please continue.')}</AppText>
            )}
          </>
        )}
      </ScreenSection>
      <BottomButtons>
        {status === 'idle' && (
          <ButtonStyled
            iconProps={{ name: 'search-outline' }}
            title={t('Start scanning')}
            onPress={handleStartScanPress}
            variant="contrast"
          />
        )}
        {status === 'started' && (
          <ButtonStyled
            iconProps={{ name: 'close' }}
            title={t('Stop scanning')}
            onPress={handleStopScanPress}
            variant="contrast"
          />
        )}
        {status === 'stopped' && (
          <ContinueButton
            iconProps={{ name: 'search-outline' }}
            title={t('Continue scanning')}
            onPress={handleContinueScanPress}
            variant="contrast"
          />
        )}
        {discoveredAddresses.length > 0 && (status === 'stopped' || status === 'finished') && (
          <ButtonStyled
            iconProps={{ name: 'download-outline' }}
            title={t('Import selected addresses')}
            onPress={importAddresses}
            disabled={selectedAddressesToImport.length === 0}
            variant="contrast"
          />
        )}
        {discoveredAddresses.length === 0 && status === 'finished' && !importLoading && (
          <ButtonStyled
            iconProps={{ name: isImporting ? 'arrow-forward' : 'arrow-back' }}
            title={isImporting ? t('Continue') : t('Go back')}
            onPress={continueToNextScreen}
            variant={isImporting ? 'contrast' : 'accent'}
          />
        )}
      </BottomButtons>
    </ScrollScreen>
  )
}

export default AddressDiscoveryScreen

const CurrentAddresses = () => {
  const addresses = useUnsortedAddressesHashes()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
  }

  return (
    <>
      <ScreenSectionTitle>{t('Current addresses')}</ScreenSectionTitle>
      <Surface>
        {addresses.map((addressHash, index) => (
          <AddressBox
            key={addressHash}
            addressHash={addressHash}
            isLast={index === addresses.length - 1}
            onPress={() => handleAddressPress(addressHash)}
            origin="addressesScreen"
          />
        ))}
      </Surface>
    </>
  )
}

const ScanningIndication = styled.View`
  margin-bottom: 20px;
  align-items: center;
`

const AmountStyled = styled(Amount)`
  margin-right: 10px;
`

const ButtonStyled = styled(Button)`
  width: 100%;
`

const ContinueButton = styled(ButtonStyled)`
  margin-bottom: 24px;
`

const AmountContent = styled.View`
  flex-direction: row;
  align-items: center;
`
