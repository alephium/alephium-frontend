import { AnalyticsEvent } from '@alephium/shared'
import { formatAmountForDisplay } from '@alephium/shared/numbers'
import { selectSentTransactionByHash } from '@alephium/shared/store'
import { AddressHash } from '@alephium/shared/types'
import { queryClient, usePendingTxPolling } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import useAlphStaking from '~/features/staking/hooks/useAlphStaking'
import {
  UnstakeRequest,
  unstakeVaultRequestsQueryKeyRoot
} from '~/features/staking/hooks/useFetchAddressUnstakeRequests'
import useFetchXAlphTokenState from '~/features/staking/hooks/useFetchXAlphTokenState'
import { vaultActionCompleted } from '~/features/staking/stakingSlice'
import { formatUnstakeTimeLeft, getCancelUnstakeXAlphOut, isClaimable } from '~/features/staking/stakingUtils'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast, showToast } from '~/utils/layout'

interface UnstakingRequestItemProps {
  request: UnstakeRequest
  addressHash: AddressHash
}

const UnstakingRequestItem = ({ request, addressHash }: UnstakingRequestItemProps) => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const { claimUnstaked, cancelUnstake } = useAlphStaking()
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const [isClaiming, setIsClaiming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const { data: xAlphTokenState } = useFetchXAlphTokenState()

  const vaultIndex = request.vaultIndex.toString()
  const pendingVaultAction = useAppSelector((s) => s.staking.pendingVaultActions[vaultIndex])

  const handleVaultActionConfirmed = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ['address', addressHash, 'transaction', 'latest'] })
    await queryClient.invalidateQueries({ queryKey: unstakeVaultRequestsQueryKeyRoot })
    dispatch(vaultActionCompleted(vaultIndex))
    sendAnalytics({ event: AnalyticsEvent.STAKE_CONFIRMED, props: { action: pendingVaultAction?.type } })
    showToast({
      type: 'success',
      text1: pendingVaultAction?.type === 'claim' ? t('ALPH claimed!') : t('Unstake request cancelled!')
    })
  }, [addressHash, vaultIndex, pendingVaultAction?.type, dispatch, t])

  const now = Date.now()
  const endTime = Number(request.startTime + request.duration)
  const isFullyUnlocked = now >= endTime
  const timeLeft = formatUnstakeTimeLeft(endTime - now)
  const progress =
    request.duration > BigInt(0)
      ? Math.min(100, Math.max(0, ((now - Number(request.startTime)) / Number(request.duration)) * 100))
      : 0

  const canClaim = isClaimable(request.claimableAmount)
  const leftToClaim = request.totalAmount - request.withdrawnAmount

  const onClaimPress = async () => {
    if (isClaiming) return
    if (!canClaim) {
      const claimableAmount = `${formatAmountForDisplay({
        amount: request.claimableAmount,
        amountDecimals: ALPH.decimals
      })} ALPH`
      Alert.alert(
        '',
        t('Amount is too low to be claimed just yet ({{claimableAmount}}). Please try again later.', {
          claimableAmount
        })
      )
      return
    }
    await submitClaim()
  }

  const submitClaim = () => {
    sendAnalytics({ event: AnalyticsEvent.STAKE_INITIATED, props: { action: 'claim' } })

    triggerBiometricsAuthGuard({
      settingsToCheck: 'transactions',
      successCallback: () =>
        triggerFundPasswordAuthGuard({
          successCallback: async () => {
            setIsClaiming(true)
            try {
              showToast({ type: 'info', text1: t('Claiming ALPH...') })
              await claimUnstaked(request.vaultIndex, request.claimableAmount)
            } catch (error) {
              sendAnalytics({ event: AnalyticsEvent.STAKE_FAILED, props: { action: 'claim' } })
              showExceptionToast(error, t('Claim'))
            } finally {
              setIsClaiming(false)
            }
          }
        })
    })
  }

  const handleCancel = () => {
    const notYetClaimableAlph = leftToClaim - request.claimableAmount
    const xAlphOut = getCancelUnstakeXAlphOut(
      notYetClaimableAlph,
      xAlphTokenState?.fields.totalXAlphSupply ?? 0n,
      xAlphTokenState?.fields.totalDepositedAlph ?? 0n
    )
    const message = [
      t('Are you sure you want to cancel this unstaking request?'),
      t('You will get back {{xAlphAmount}} xALPH and {{alphAmount}} ALPH.', {
        xAlphAmount: formatAlph(xAlphOut),
        alphAmount: formatAlph(request.claimableAmount)
      }),
      request.withdrawnAmount > 0n
        ? t('The {{amount}} ALPH you already claimed stays in your wallet.', {
            amount: formatAlph(request.withdrawnAmount)
          })
        : undefined
    ]
      .filter(Boolean)
      .join('\n\n')

    Alert.alert(t('Cancel unstaking'), message, [
      { text: t('No'), style: 'cancel' },
      {
        text: t('Yes, cancel'),
        style: 'destructive',
        onPress: () => {
          sendAnalytics({ event: AnalyticsEvent.STAKE_INITIATED, props: { action: 'cancel' } })

          triggerBiometricsAuthGuard({
            settingsToCheck: 'transactions',
            successCallback: () =>
              triggerFundPasswordAuthGuard({
                successCallback: async () => {
                  setIsCancelling(true)
                  try {
                    showToast({ type: 'info', text1: t('Cancelling unstaking request...') })
                    await cancelUnstake(request.vaultIndex)
                  } catch (error) {
                    sendAnalytics({ event: AnalyticsEvent.STAKE_FAILED, props: { action: 'cancel' } })
                    showExceptionToast(error, t('Cancel unstaking'))
                  } finally {
                    setIsCancelling(false)
                  }
                }
              })
          })
        }
      }
    ])
  }

  return (
    <Container>
      {pendingVaultAction && (
        <VaultActionConfirmationPoller txHash={pendingVaultAction.txHash} onConfirmed={handleVaultActionConfirmed} />
      )}
      <Row>
        <DataColumn>
          <DataLabel>{t('Left to claim')}</DataLabel>
          <DataValue>
            {request.withdrawnAmount > 0n
              ? t('{{amount}} of {{total}}', {
                  amount: formatAlph(leftToClaim),
                  total: formatAlph(request.totalAmount)
                })
              : formatAlph(request.totalAmount)}{' '}
            ALPH
          </DataValue>
          {request.withdrawnAmount > 0n && (
            <DataHint>{t('{{amount}} claimed', { amount: `${formatAlph(request.withdrawnAmount)} ALPH` })}</DataHint>
          )}
        </DataColumn>
        <DataColumn style={{ alignItems: 'flex-end' }}>
          <DataLabel>{t('Full unlock')}</DataLabel>
          <DataValue>
            {new Date(endTime).toLocaleDateString(i18n.language, { dateStyle: 'medium' })}
            {timeLeft && ` (${timeLeft})`}
          </DataValue>
        </DataColumn>
      </Row>

      <Row>
        <DataColumn>
          <DataLabel>{t('Claimable now')}</DataLabel>
          <DataValue>
            {canClaim
              ? `${formatAmountForDisplay({ amount: request.claimableAmount, amountDecimals: ALPH.decimals })} ALPH`
              : '-'}
          </DataValue>
        </DataColumn>

        <ProgressBarContainer>
          <ProgressBar style={{ width: `${progress}%` }} />
        </ProgressBarContainer>
      </Row>

      <ButtonRow>
        <Button
          title={t('Claim')}
          onPress={onClaimPress}
          disabled={!canClaim || isClaiming || !!pendingVaultAction}
          loading={isClaiming || pendingVaultAction?.type === 'claim'}
          variant="accent"
          short
          flex
        />
        {!isFullyUnlocked && (
          <Button
            title={t('Cancel')}
            onPress={handleCancel}
            disabled={isCancelling || !!pendingVaultAction}
            loading={isCancelling || pendingVaultAction?.type === 'cancel'}
            type="secondary"
            variant="default"
            short
            flex
          />
        )}
      </ButtonRow>
    </Container>
  )
}

export default UnstakingRequestItem

const formatAlph = (amount: bigint) => formatAmountForDisplay({ amount, amountDecimals: ALPH.decimals })

interface VaultActionConfirmationPollerProps {
  txHash: string
  onConfirmed: () => void
}

const VaultActionConfirmationPoller = ({ txHash, onConfirmed }: VaultActionConfirmationPollerProps) => {
  const confirmedRef = useRef(false)
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))

  usePendingTxPolling(txHash)

  useEffect(() => {
    if (sentTx?.status === 'confirmed' && !confirmedRef.current) {
      confirmedRef.current = true
      onConfirmed()
    }
  }, [sentTx?.status, onConfirmed])

  return null
}

const Container = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 16px;
  padding: ${DEFAULT_MARGIN}px;
  gap: 12px;
`

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`

const DataColumn = styled.View`
  gap: 2px;
`

const DataLabel = styled(AppText)`
  font-size: 12px;
  color: ${({ theme }) => theme.font.tertiary};
`

const DataValue = styled(AppText)`
  font-size: 14px;
  font-weight: 600;
`

const DataHint = styled(AppText)`
  font-size: 12px;
  color: ${({ theme }) => theme.font.tertiary};
`

const ButtonRow = styled.View`
  flex-direction: row;
  gap: 10px;
`

const ProgressBarContainer = styled.View<{ $fullWidth?: boolean }>`
  height: 4px;
  background-color: ${({ theme }) => theme.border.primary};
  border-radius: 2px;
  flex: 1;
  align-self: ${({ $fullWidth }) => ($fullWidth ? 'stretch' : 'center')};
  margin-left: ${({ $fullWidth }) => ($fullWidth ? 0 : 12)}px;
  max-width: ${({ $fullWidth }) => ($fullWidth ? '100%' : '80px')};
`

const ProgressBar = styled.View`
  height: 100%;
  background-color: ${({ theme }) => theme.global.accent};
  border-radius: 2px;
`
