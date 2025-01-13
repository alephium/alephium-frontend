import { colord } from 'colord'
import { motion } from 'framer-motion'
import { map } from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ShortcutButtonsGroupWallet } from '@/components/Buttons/ShortcutButtons'
import { useScrollContext } from '@/contexts/scroll'
import WalletTransactionsList from '@/features/transactionsDisplay/transactionLists/lists/WalletTransactionsList'
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'
import FiltersPanel from '@/pages/UnlockedWallet/TransfersPage/FiltersPanel'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'
import { walletSidebarWidthPx } from '@/style/globalStyles'
import { TokenId } from '@/types/tokens'
import { directionOptions } from '@/utils/transactions'

interface TransfersPageProps {
  className?: string
}

const TransfersPage = ({ className }: TransfersPageProps) => {
  const { t } = useTranslation()
  const addresses = useUnsortedAddresses()
  const { scrollDirection } = useScrollContext()

  const [direction, setDirection] = useState(scrollDirection?.get())
  const [selectedAddresses, setSelectedAddresses] = useState(addresses)
  const [selectedDirections, setSelectedDirections] = useState(directionOptions)
  const [selectedTokensIds, setSelectedTokensIds] = useState<TokenId[]>()

  useEffect(() => {
    scrollDirection?.on('change', setDirection)

    return () => scrollDirection?.destroy()
  }, [scrollDirection])

  // TODO: The props of WalletTransactionsList change on every render due to the map function.
  // This needs to be improved because we perform heavy computations to transform Tanstack data to display transactions.
  // We could try storing the filtering criteria in Redux instead of prop drilling.

  return (
    <UnlockedWalletPage
      title={t('Transfers')}
      subtitle={t('Browse your transaction history. Execute new transfers easily.')}
      className={className}
    >
      <FiltersPanel
        selectedAddresses={selectedAddresses}
        setSelectedAddresses={setSelectedAddresses}
        selectedDirections={selectedDirections}
        setSelectedDirections={setSelectedDirections}
        selectedTokensIds={selectedTokensIds}
        setSelectedTokensIds={setSelectedTokensIds}
      />
      <StyledUnlockedWalletPanel doubleTop bottom backgroundColor="background1">
        <WalletTransactionsList
          addressHashes={map(selectedAddresses, 'hash')}
          directions={map(selectedDirections, 'value')}
          assetIds={selectedTokensIds}
        />
      </StyledUnlockedWalletPanel>
      <BottomRow
        animate={{ y: direction === 'down' ? 100 : 0 }}
        transition={{ easings: 'spring', stiffness: 500, damping: 40 }}
      >
        <CornerButtons>
          <ButtonsGrid>
            <ShortcutButtonsGroupWallet highlight analyticsOrigin="transfer_page" />
          </ButtonsGrid>
        </CornerButtons>
      </BottomRow>
    </UnlockedWalletPage>
  )
}

export default TransfersPage

const BottomRow = styled(motion.div)`
  position: fixed;
  bottom: 25px;
  width: calc(100% - ${walletSidebarWidthPx}px);
  display: flex;
  justify-content: center;
  z-index: 1;
`

const CornerButtons = styled.div`
  position: absolute;
  bottom: 0;
  border-radius: 100px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) =>
    colord(theme.name === 'light' ? theme.bg.primary : theme.bg.background2)
      .alpha(0.9)
      .toHex()};
  backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => theme.shadow.secondary};
  max-width: 320px;
  min-width: 230px;

  button {
    &:first-child {
      padding-left: var(--spacing-4);
    }

    &:last-child {
      padding-right: var(--spacing-4);
    }
  }
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
`

const StyledUnlockedWalletPanel = styled(UnlockedWalletPanel)`
  flex: 1;
`
