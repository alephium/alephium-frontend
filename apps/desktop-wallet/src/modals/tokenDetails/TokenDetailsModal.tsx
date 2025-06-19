import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ShortcutButtonsGroupToken } from '@/components/Buttons/ShortcutButtons'
import LabeledWorthOverview from '@/components/LabeledWorthOverview'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import SideModal from '@/modals/SideModal'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'
import TokenBalances from '@/modals/tokenDetails/TokenBalances'
import TokenDescription from '@/modals/tokenDetails/TokenDescription'
import TokenDetailsModalHeader from '@/modals/tokenDetails/TokenDetailsModalHeader'
import { TokenDetailsModalTabs } from '@/modals/tokenDetails/TokenDetailsModalTabs'

const TokenDetailsModal = memo<TokenDetailsModalProps & ModalBaseProp>(({ id, tokenId }) => {
  const { t } = useTranslation()

  return (
    <SideModal id={id} title={t('Token balance')} width={800} header={<TokenDetailsModalHeader tokenId={tokenId} />}>
      <WorthOverviewPanel>
        <LabeledWorthOverview label={t('Token balance')}>
          <TokenBalances tokenId={tokenId} />
        </LabeledWorthOverview>
        <ShortcutButtonsGroupToken tokenId={tokenId} analyticsOrigin="token_details" />
      </WorthOverviewPanel>
      <TokenDescription tokenId={tokenId} />
      <Content>
        <TokenDetailsModalTabs tokenId={tokenId} />
      </Content>
    </SideModal>
  )
})

export default TokenDetailsModal

const Content = styled.div`
  padding: 0 var(--spacing-4) var(--spacing-4);
  position: relative;
  gap: 45px;
  display: flex;
  flex-direction: column;
`

const WorthOverviewPanel = styled.div`
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: 30px;
`
