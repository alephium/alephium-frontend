import { AnalyticsEvent, getHumanReadableError } from '@alephium/shared'
import { addressSettingsSaved, selectAddressByHash } from '@alephium/shared/store'
import { isInsufficientFundsError } from '@alephium/shared/utils'
import { useFetchAddressBalancesAlph } from '@alephium/shared-react'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { fetchSweepTransactionsFees, sendSweepTransactions } from '~/api/transactions'
import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { addressMigrated } from '~/features/addressMigration/addressMigrationActions'
import {
  addressMigrationExecutionInitialState,
  addressMigrationExecutionReducer
} from '~/features/addressMigration/addressMigrationExecutionMachine'
import AddressMigrationProgressStepper from '~/features/addressMigration/components/AddressMigrationProgressStepper'
import MigrationTxPoller from '~/features/addressMigration/components/MigrationTxPoller'
import useAreMigrationTxsConfirmed from '~/features/addressMigration/hooks/useAreMigrationTxsConfirmed'
import useFetchMigrationSweepFee from '~/features/addressMigration/hooks/useFetchMigrationSweepFee'
import useMigrationDestinationAddress from '~/features/addressMigration/hooks/useMigrationDestinationAddress'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

type AddressMigrationScreenProps = StackScreenProps<RootStackParamList, 'AddressMigrationScreen'>

const AddressMigrationScreen = ({ navigation, route }: AddressMigrationScreenProps) => {
  const { fromAddressHash, origin } = route.params
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, fromAddressHash))
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const { destination, grouplessAddresses, selectDestination, resolveDestinationAddressHash } =
    useMigrationDestinationAddress()

  const [execution, dispatchExecution] = useReducer(
    addressMigrationExecutionReducer,
    addressMigrationExecutionInitialState
  )

  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchAddressBalancesAlph({
    addressHash: fromAddressHash
  })

  const txHashes = execution.status === 'submitted' ? execution.txHashes : []
  const areTxsConfirmed = useAreMigrationTxsConfirmed(txHashes)

  const hasNothingToMigrate = !!alphBalances && BigInt(alphBalances.totalBalance) === 0n

  const { error: feeEstimationError, isLoading: isEstimatingFee } = useFetchMigrationSweepFee({
    fromAddress,
    toAddressHash: destination?.hash ?? fromAddressHash,
    enabled: !isLoadingAlphBalances && !hasNothingToMigrate
  })

  useEffect(() => {
    if (execution.status === 'submitted' && (execution.txHashes.length === 0 || areTxsConfirmed))
      dispatchExecution({ type: 'CONFIRMED' })
  }, [areTxsConfirmed, execution])

  useEffect(() => {
    if (execution.status !== 'done') return

    sendAnalytics({ event: AnalyticsEvent.ADDRESS_MIGRATION_CONFIRMED, props: { origin } })

    dispatch(addressSettingsSaved({ addressHash: execution.toAddressHash, settings: { isDefault: true } }))
    dispatch(addressMigrated({ fromAddressHash, toAddressHash: execution.toAddressHash }))
    navigation.goBack()
  }, [dispatch, execution, fromAddressHash, navigation, origin])

  const handleTxConflicted = useCallback(
    () =>
      dispatchExecution({
        type: 'FAILED',
        message: t('A transaction could not be included in a block. Please, try again.'),
        someTxsBroadcast: true
      }),
    [t]
  )

  const openDestinationSelect = () =>
    dispatch(
      openModal({
        name: 'SelectAddressModal',
        props: {
          addressHashes: grouplessAddresses.map(({ hash }) => hash),
          onAddressPress: selectDestination
        }
      })
    )

  const migrate = async () => {
    if (!fromAddress) return

    dispatchExecution({ type: 'PREPARE' })

    let toAddressHash: string
    const createdNewAddress = !destination

    try {
      toAddressHash = await resolveDestinationAddressHash()
    } catch (error) {
      sendAnalytics({ event: AnalyticsEvent.ADDRESS_MIGRATION_FAILED, props: { origin, error_code: 'address_error' } })
      dispatchExecution({
        type: 'FAILED',
        message: t('Could not create the new address'),
        details: getHumanReadableError(error, '')
      })
      return
    }

    if (hasNothingToMigrate) {
      dispatchExecution({ type: 'PREPARED', toAddressHash, fee: 0n })
      dispatchExecution({ type: 'SUBMITTED', txHashes: [] })
      return
    }

    const txParams = { signerAddress: fromAddressHash, signerKeyType: fromAddress.keyType, toAddress: toAddressHash }

    try {
      const fee = await fetchSweepTransactionsFees(txParams)

      dispatchExecution({ type: 'PREPARED', toAddressHash, fee })
    } catch (error) {
      sendAnalytics({ event: AnalyticsEvent.ADDRESS_MIGRATION_FAILED, props: { origin, error_code: 'build_error' } })
      dispatchExecution({
        type: 'FAILED',
        message: t('Could not prepare the transfer'),
        details: getHumanReadableError(error, '')
      })
      return
    }

    try {
      const results = await sendSweepTransactions(txParams)

      sendAnalytics({
        event: AnalyticsEvent.ADDRESS_MIGRATION_EXECUTED,
        props: { origin, created_new_address: createdNewAddress }
      })
      dispatchExecution({ type: 'SUBMITTED', txHashes: results.map(({ txId }) => txId) })
    } catch (error) {
      sendAnalytics({ event: AnalyticsEvent.ADDRESS_MIGRATION_FAILED, props: { origin, error_code: 'submit_error' } })
      dispatchExecution({
        type: 'FAILED',
        message: t('Could not transfer your assets'),
        details: getHumanReadableError(error, ''),
        someTxsBroadcast: true
      })
    }
  }

  const handleMigratePress = () => {
    sendAnalytics({ event: AnalyticsEvent.ADDRESS_MIGRATION_INITIATED, props: { origin } })

    triggerBiometricsAuthGuard({
      settingsToCheck: 'transactions',
      successCallback: () => triggerFundPasswordAuthGuard({ successCallback: migrate })
    })
  }

  if (!fromAddress) return null

  const isInProgress = execution.status !== 'idle' && execution.status !== 'error'
  const isBlocked = !!feeEstimationError && isInsufficientFundsError(feeEstimationError)

  return (
    <ScrollScreen
      verticalGap
      contentPaddingTop
      style={{ paddingHorizontal: DEFAULT_MARGIN }}
      headerOptions={{ type: 'stack', headerTitle: t('New address type') }}
      screenTitle={t('Get the new address type')}
      screenIntro={t(
        "Your assets will be moved to Alephium's new address type, which works everywhere in the ecosystem."
      )}
      bottomButtonsRender={() => (
        <Button
          title={execution.status === 'error' ? t('Try again') : t('Migrate')}
          onPress={handleMigratePress}
          disabled={isInProgress || isBlocked || isLoadingAlphBalances || isEstimatingFee}
          loading={isInProgress}
          variant="highlight"
        />
      )}
    >
      <Section>
        <SectionLabel color="tertiary" size={13}>
          {t('From')}
        </SectionLabel>
        <AddressBox addressHash={fromAddressHash} origin="origin_address" rounded noBottomMargin showGroup />
      </Section>

      <Section>
        <SectionLabel color="tertiary" size={13}>
          {t('To')}
        </SectionLabel>
        {destination ? (
          <AddressBox
            addressHash={destination.hash}
            origin="destination_address"
            rounded
            noBottomMargin
            onPress={grouplessAddresses.length > 1 ? openDestinationSelect : undefined}
            disabled={isInProgress || grouplessAddresses.length <= 1}
          />
        ) : (
          <AppText color="secondary">{t('A new address will be created for you.')}</AppText>
        )}
      </Section>

      {isBlocked && (
        <AppText color="alert">
          {t(
            'This address does not have enough ALPH to pay for the transfer fee. Send it a little ALPH and try again.'
          )}
        </AppText>
      )}

      {execution.status === 'error' && execution.someTxsBroadcast && (
        <AppText color="secondary">
          {t('Part of your assets may already have been transferred. Trying again moves whatever is left.')}
        </AppText>
      )}

      {execution.status !== 'idle' && <AddressMigrationProgressStepper execution={execution} />}

      {txHashes.map((txHash) => (
        <MigrationTxPoller key={txHash} txHash={txHash} onTxConflicted={handleTxConflicted} />
      ))}
    </ScrollScreen>
  )
}

export default AddressMigrationScreen

const Section = styled.View`
  gap: 8px;
`

const SectionLabel = styled(AppText)`
  margin-left: 4px;
`
