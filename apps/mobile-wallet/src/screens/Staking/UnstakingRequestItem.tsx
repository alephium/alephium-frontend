import { ALPH } from '@alephium/token-list'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import useAlphStaking from '~/features/staking/hooks/useAlphStaking'
import { UnstakeRequest } from '~/features/staking/hooks/useFetchAddressUnstakeRequests'
import { formatTokenAmount, isClaimable } from '~/features/staking/stakingUtils'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast, showToast } from '~/utils/layout'

interface UnstakingRequestItemProps {
  request: UnstakeRequest
}

const UnstakingRequestItem = ({ request }: UnstakingRequestItemProps) => {
  const { t } = useTranslation()
  const { claimUnstaked, cancelUnstake } = useAlphStaking()
  const [isClaiming, setIsClaiming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

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
      const claimableAmount = `${formatTokenAmount(request.claimableAmount, ALPH.decimals)} ALPH`
      Alert.alert(
        '',
        t('Amount is too low to be claimed just yet ({{claimableAmount}}). Please try again later.', {
          claimableAmount
        }) as string
      )
      return
    }
    await submitClaim()
  }

  const submitClaim = async () => {
    setIsClaiming(true)
    try {
      await claimUnstaked(request.vaultIndex, request.claimableAmount)
      showToast({ type: 'success', text1: t('Transaction sent') })
    } catch (error) {
      showExceptionToast(error, t('Claim'))
    } finally {
      setIsClaiming(false)
    }
  }

  const handleCancel = () => {
    Alert.alert(
      t('Cancel unstaking') as string,
      t('Are you sure you want to cancel this unstaking request?') as string,
      [
        { text: t('No') as string, style: 'cancel' },
        {
          text: t('Yes, cancel') as string,
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true)
            try {
              await cancelUnstake(request.vaultIndex)
              showToast({ type: 'success', text1: t('Transaction sent') })
            } catch (error) {
              showExceptionToast(error, t('Cancel unstaking'))
            } finally {
              setIsCancelling(false)
            }
          }
        }
      ]
    )
  }

  return (
    <Container>
      <Row>
        <DataColumn>
          <DataLabel>{t('Amount')}</DataLabel>
          <DataValue>{formatTokenAmount(request.totalAmount, ALPH.decimals)} ALPH</DataValue>
        </DataColumn>
        <DataColumn style={{ alignItems: 'flex-end' }}>
          <DataLabel>{t('Full unlock')}</DataLabel>
          <DataValue>
            {dayjs(endTime).format('MMM D, YYYY')} ({daysLeft}d)
          </DataValue>
        </DataColumn>
      </Row>

      <Row>
        {canClaim ? (
          <DataColumn>
            <DataLabel>{t('Claimable now')}</DataLabel>
            <DataValue>{formatTokenAmount(request.claimableAmount, ALPH.decimals)} ALPH</DataValue>
          </DataColumn>
        ) : null}
        <ProgressBarContainer $fullWidth={!canClaim}>
          <ProgressBar style={{ width: `${progress}%` }} />
        </ProgressBarContainer>
      </Row>

      <ButtonRow>
        <Pressable style={{ flex: 1 }} onPress={onClaimPress} disabled={isClaiming}>
          <Button
            title={t('Claim') as string}
            onPress={() => undefined}
            disabled={!canClaim || isClaiming}
            pointerEvents="none"
            loading={isClaiming}
            variant="accent"
            short
            flex
          />
        </Pressable>
        {!isFullyUnlocked && (
          <Button
            title={t('Cancel') as string}
            onPress={handleCancel}
            loading={isCancelling}
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
