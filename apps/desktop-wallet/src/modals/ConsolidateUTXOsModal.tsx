import { ALPH } from '@alephium/token-list'
import { Codesandbox } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import Spinner from '@/components/Spinner'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { HeaderContent, HeaderLogo } from '@/modals/CenteredModal'

export interface ConsolidateUTXOsModalProps {
  onConsolidateClick: () => void
  fee: bigint | undefined
}

const ConsolidateUTXOsModal = memo(({ id, onConsolidateClick, fee }: ModalBaseProp & ConsolidateUTXOsModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const handleConsolidateClick = () => {
    dispatch(closeModal({ id }))
    onConsolidateClick()
  }

  return (
    <CenteredModal title={t('Consolidate UTXOs')} id={id}>
      <HeaderContent>
        <HeaderLogo>
          <Codesandbox color={theme.global.accent} size="70%" strokeWidth={0.7} />
        </HeaderLogo>
        <Section>
          <InfoBox
            importance="accent"
            text={t(
              'It appears that your wallet has too many UTXOs to be able to send this transaction. Please, consolidate (merge) your UTXOs first. This will cost a small fee.'
            )}
          />
          <Fee>
            {t('Fee')}
            {fee ? <Amount tokenId={ALPH.id} value={fee} /> : <Spinner size="12px" />}
          </Fee>
          <Button onClick={handleConsolidateClick} submit disabled={!fee}>
            {t('Consolidate')}
          </Button>
        </Section>
      </HeaderContent>
    </CenteredModal>
  )
})

export default ConsolidateUTXOsModal

const Fee = styled.div`
  padding: 12px;
  display: flex;
  gap: 80px;
  width: 100%;
`
