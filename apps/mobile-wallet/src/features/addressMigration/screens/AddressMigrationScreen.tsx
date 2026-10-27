import { AnalyticsEvent, getHumanReadableError } from '@alephium/shared'
import { addressSettingsSaved, selectAddressByHash, selectDefaultAddressHash } from '@alephium/shared/store'
import { AddressHash } from '@alephium/shared/types'
import { isInsufficientFundsError } from '@alephium/shared/utils'
import { useFetchAddressBalancesAlph } from '@alephium/shared-react'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { sendSweepTransactions } from '~/api/transactions'
import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ScrollScreen from '~/components/layout/ScrollScreen'
import Surface from '~/components/layout/Surface'
import { addressMigrated } from '~/features/addressMigration/addressMigrationActions'
import {
  addressMigrationExecutionInitialState,
  addressMigrationExecutionReducer
} from '~/features/addressMigration/addressMigrationExecutionMachine'
import AddressMigrationProgressStepper from '~/features/addressMigration/components/AddressMigrationProgressStepper'
import MigrationTxPoller from '~/features/addressMigration/components/MigrationTxPoller'
import useConfirmedMigrationTxsCount from '~/features/addressMigration/hooks/useConfirmedMigrationTxsCount'
import useFetchMigrationSweepFee from '~/features/addressMigration/hooks/useFetchMigrationSweepFee'
import useMigrationDestinationAddress from '~/features/addressMigration/hooks/useMigrationDestinationAddress'
import SignModalFeesRow from '~/features/ecosystem/modals/SignModalFeesRow'
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
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
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
  const confirmedTxsCount = useConfirmedMigrationTxsCount(txHashes)
  const [conflictedTxHashes, setConflictedTxHashes] = useState<string[]>([])
  const wasDefaultAddressRef = useRef(false)

  const hasNothingToMigrate = !!alphBalances && BigInt(alphBalances.availableBalance) === 0n

  const {
    fee,
    error: feeEstimationError,
    isLoading: isEstimatingFee
  } = useFetchMigrationSweepFee({
    fromAddress,
    toAddressHash: destination?.hash ?? fromAddressHash,
    enabled: !isLoadingAlphBalances && !hasNothingToMigrate
  })

  useEffect(() => {
    if (execution.status !== 'submitted') return

    const txsCount = execution.txHashes.length

    if (txsCount === 0 || confirmedTxsCount === txsCount) {
      dispatchExecution({ type: 'CONFIRMED' })
    } else if (confirmedTxsCount + conflictedTxHashes.length === txsCount) {
      dispatchExecution({
        type: 'FAILED',
        message: t('A transaction could not be included in a block. Please, try again.'),
        someTxsBroadcast: true
      })
    }
  }, [conflictedTxHashes.length, confirmedTxsCount, execution, t])

  useEffect(() => {
    if (execution.status !== 'done') return

    sendAnalytics({ event: AnalyticsEvent.ADDRESS_MIGRATION_CONFIRMED, props: { origin } })
    navigation.goBack()
  }, [execution, navigation, origin])

  const updateSelectedAddress = useCallback(
    (toAddressHash: AddressHash) => {
      if (wasDefaultAddressRef.current)
        dispatch(addressSettingsSaved({ addressHash: toAddressHash, settings: { isDefault: true } }))

      dispatch(addressMigrated({ fromAddressHash, toAddressHash }))
    },
    [dispatch, fromAddressHash]
  )

  const handleTxConflicted = useCallback(
    (txHash: string) => setConflictedTxHashes((hashes) => (hashes.includes(txHash) ? hashes : [...hashes, txHash])),
    []
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
    setConflictedTxHashes([])
    wasDefaultAddressRef.current = fromAddressHash === defaultAddressHash

    if (feeEstimationError) {
      sendAnalytics({ event: AnalyticsEvent.ADDRESS_MIGRATION_FAILED, props: { origin, error_code: 'build_error' } })
      dispatchExecution({
        type: 'FAILED',
        message: t('Could not prepare the transfer'),
        details: getHumanReadableError(feeEstimationError, '')
      })
      return
    }

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

    dispatchExecution({ type: 'PREPARED', toAddressHash, fee: fee ?? 0n })

    if (hasNothingToMigrate) {
      updateSelectedAddress(toAddressHash)
      dispatchExecution({ type: 'SUBMITTED', txHashes: [] })
      return
    }

    const txParams = { signerAddress: fromAddressHash, signerKeyType: fromAddress.keyType, toAddress: toAddressHash }

    try {
      const results = await sendSweepTransactions(txParams)

      sendAnalytics({
        event: AnalyticsEvent.ADDRESS_MIGRATION_EXECUTED,
        props: { origin, created_new_address: createdNewAddress }
      })
      updateSelectedAddress(toAddressHash)
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
      screenIntro={t("Your assets will be moved to Alephium's new address type (groupless).")}
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

      {fee !== undefined && (
        <Surface>
          <SignModalFeesRow fees={fee} />
        </Surface>
      )}

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
