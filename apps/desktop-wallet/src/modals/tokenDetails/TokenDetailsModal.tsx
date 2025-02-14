import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AnimatedBackground from '@/components/AnimatedBackground'
import { ShortcutButtonsGroupToken } from '@/components/Buttons/ShortcutButtons'
import LabeledWorthOverview from '@/components/LabeledWorthOverview'
import withModal from '@/features/modals/withModal'
import SideModal from '@/modals/SideModal'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'
import TokenBalances from '@/modals/tokenDetails/TokenBalances'
import TokenDetailsModalHeader from '@/modals/tokenDetails/TokenDetailsModalHeader'
import { TokenDetailsModalTabs } from '@/modals/tokenDetails/TokenDetailsModalTabs'

const TokenDetailsModal = withModal<TokenDetailsModalProps>(({ id, tokenId }) => {
  const { t } = useTranslation()

  return (
    <SideModal id={id} title={t('Token balance')} width={800} header={<TokenDetailsModalHeader tokenId={tokenId} />}>
      <LabeledWorthOverview label={t('Token balance')}>
        <TokenBalances tokenId={tokenId} />
      </LabeledWorthOverview>
      <Content>
        <AnimatedBackground anchorPosition="top" verticalOffset={-300} opacity={0.5} />
        <ShortcutButtonsGroupToken tokenId={tokenId} analyticsOrigin="token_details" />
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
