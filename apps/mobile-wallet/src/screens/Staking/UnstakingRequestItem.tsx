import { AddressHash, formatAmountForDisplay, selectSentTransactionByHash } from '@alephium/shared'
import { queryClient, usePendingTxPolling } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import dayjs from 'dayjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import useAlphStaking from '~/features/staking/hooks/useAlphStaking'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import {
  UnstakeRequest,
  unstakeVaultRequestsQueryKeyRoot
} from '~/features/staking/hooks/useFetchAddressUnstakeRequests'
import { vaultActionCompleted } from '~/features/staking/stakingSlice'
import { isClaimable } from '~/features/staking/stakingUtils'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast, showToast } from '~/utils/layout'

interface UnstakingRequestItemProps {
  request: UnstakeRequest
  addressHash: AddressHash
}

const UnstakingRequestItem = ({ request, addressHash }: UnstakingRequestItemProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { claimUnstaked, cancelUnstake } = useAlphStaking()
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const [isClaiming, setIsClaiming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const vaultIndex = request.vaultIndex.toString()
  const pendingVaultAction = useAppSelector((s) => s.staking.pendingVaultActions[vaultIndex])

  const handleVaultActionConfirmed = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ['address', addressHash, 'transaction', 'latest'] })
    await queryClient.invalidateQueries({ queryKey: unstakeVaultRequestsQueryKeyRoot })
    dispatch(vaultActionCompleted(vaultIndex))
    showToast({
      type: 'success',
      text1: pendingVaultAction?.type === 'claim' ? t('ALPH claimed!') : t('Unstake request cancelled!')
    })
  }, [addressHash, vaultIndex, pendingVaultAction?.type, dispatch, t])

  const now = Date.now()
  const endTime = Number(request.startTime + request.duration)
  const isFullyUnlocked = now >= endTime
  const daysLeft = Math.max(0, Math.ceil((endTime - now) / (1000 * 60 * 60 * 24)))
  const progress =
    request.duration > BigInt(0)
      ? Math.min(100, Math.max(0, ((now - Number(request.startTime)) / Number(request.duration)) * 100))
      : 0

  const canClaim = isClaimable(request.claimableAmount)

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
              showExceptionToast(error, t('Claim'))
            } finally {
              setIsClaiming(false)
            }
          }
        })
    })
  }

  const handleCancel = () => {
    Alert.alert(t('Cancel unstaking'), t('Are you sure you want to cancel this unstaking request?'), [
      { text: t('No'), style: 'cancel' },
      {
        text: t('Yes, cancel'),
        style: 'destructive',
        onPress: () => {
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
          <DataLabel>{t('Amount')}</DataLabel>
          <DataValue>
            {formatAmountForDisplay({ amount: request.totalAmount, amountDecimals: ALPH.decimals })} ALPH
          </DataValue>
        </DataColumn>
        <DataColumn style={{ alignItems: 'flex-end' }}>
          <DataLabel>{t('Full unlock')}</DataLabel>
          <DataValue>
            {dayjs(endTime).format('MMM D, YYYY')} ({daysLeft}d)
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
