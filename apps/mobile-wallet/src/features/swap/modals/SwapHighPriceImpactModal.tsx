import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import BottomModal from '~/features/modals/BottomModal'
import { useModalContext } from '~/features/modals/ModalContext'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface SwapHighPriceImpactModalProps {
  priceImpactPct: number
  onConfirm: () => void
}

const SwapHighPriceImpactModal = memo<SwapHighPriceImpactModalProps>(({ priceImpactPct, onConfirm }) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()

  const handleConfirm = () => {
    dismissModal()
    onConfirm()
  }

  return (
    <BottomModal title={t('High price impact')} notScrollable>
      <Content>
        <AppText color="secondary" size={15}>
          {t(
            'The price impact for this swap is {{ percent }}%. Confirming may result in a poor price for this swap. Do you want to swap anyway?',
            { percent: priceImpactPct.toFixed(2) }
          )}
        </AppText>
        <Buttons>
          <Button title={t('Cancel')} onPress={dismissModal} flex />
          <Button title={t('Swap anyway')} onPress={handleConfirm} variant="alert" flex />
        </Buttons>
      </Content>
    </BottomModal>
  )
})

export default SwapHighPriceImpactModal

const Content = styled.View`
  gap: ${DEFAULT_MARGIN}px;
`

const Buttons = styled.View`
  flex-direction: row;
  gap: 8px;
`
