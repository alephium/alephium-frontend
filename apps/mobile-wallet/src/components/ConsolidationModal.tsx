import { SweepTxParams } from '@alephium/shared'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { sendSweepTransactions } from '~/api/transactions'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'

interface ConsolidationModalProps {
  txParams: SweepTxParams
  onSuccess: () => void
  fees: bigint
}

const ConsolidationModal = memo<ConsolidationModalProps>(({ txParams, fees, onSuccess }) => {
  const { t } = useTranslation()

  const { handleApprovePress, handleRejectPress } = useSignModal({
    onError: () => {},
    type: 'CONSOLIDATE',
    sign: async () => {
      await sendSweepTransactions(txParams)

      sendAnalytics({ event: 'Consolidated UTXOs' })
      onSuccess()
    }
  })

  return (
    <BottomModal2 contentVerticalGap>
      <ScreenSection>
        <ModalScreenTitle>{t('Consolidation required')}</ModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
        <View>
          <AppText>
            {t(
              'It appears that the address you use to send funds from has too many UTXOs! Would you like to consolidate them? This will cost as small fee.'
            )}
          </AppText>
          <Fee>
            <AppText>{t('Fee')}:</AppText>
            <Amount value={fees} fullPrecision bold />
          </Fee>
        </View>
      </ScreenSection>
      <ScreenSection centered>
        <ButtonsRow>
          <Button title={t('Cancel')} onPress={handleRejectPress} flex variant="accent" short />
          <Button title={t('Consolidate')} onPress={handleApprovePress} variant="highlight" flex short />
        </ButtonsRow>
      </ScreenSection>
    </BottomModal2>
  )
})

export default ConsolidationModal

const Fee = styled.View`
  flex-direction: row;
  gap: 5px;
  margin-top: 20px;
`
