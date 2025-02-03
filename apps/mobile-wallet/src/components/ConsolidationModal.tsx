import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'

interface ConsolidationModalProps {
  onConsolidate: () => void
  fees: bigint
}

const ConsolidationModal = withModal<ConsolidationModalProps>(({ id, onConsolidate, fees }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleConsolidate = () => {
    onConsolidate()
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id}>
      <ModalContent verticalGap>
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
            <Button title={t('Cancel')} onPress={() => dispatch(closeModal({ id }))} flex variant="accent" short />
            <Button title={t('Consolidate')} onPress={handleConsolidate} variant="highlight" flex short />
          </ButtonsRow>
        </ScreenSection>
      </ModalContent>
    </BottomModal>
  )
})

export default ConsolidationModal

const Fee = styled.View`
  flex-direction: row;
  gap: 5px;
  margin-top: 20px;
`
