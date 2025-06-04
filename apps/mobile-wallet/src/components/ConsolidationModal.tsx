import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'

interface ConsolidationModalProps {
  onConsolidate: () => void
  fees: bigint
}

const ConsolidationModal = memo<ConsolidationModalProps & ModalBaseProp>(({ id, onConsolidate, fees }) => {
  const { t } = useTranslation()
  const { dismissModal, onDismiss } = useModalDismiss({ id })

  const handleConsolidate = () => {
    onConsolidate()
    dismissModal()
  }

  const handleCancel = () => {
    dismissModal()
  }

  return (
    <BottomModal2 onDismiss={onDismiss} notScrollable modalId={id}>
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
          <Button title={t('Cancel')} onPress={handleCancel} flex variant="accent" short />
          <Button title={t('Consolidate')} onPress={handleConsolidate} variant="highlight" flex short />
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
