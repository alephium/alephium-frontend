import { map } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import WalletTransactionsList from '@/features/transactionsDisplay/transactionLists/lists/WalletTransactionsList'
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'
import FiltersPanel from '@/pages/UnlockedWallet/TransfersPage/FiltersPanel'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'
import { TokenId } from '@/types/tokens'
import { directionOptions } from '@/utils/transactions'

interface TransfersPageProps {
  className?: string
}

const TransfersPage = ({ className }: TransfersPageProps) => {
  const { t } = useTranslation()
  const addresses = useUnsortedAddresses()

  const [selectedAddresses, setSelectedAddresses] = useState(addresses)
  const [selectedDirections, setSelectedDirections] = useState(directionOptions)
  const [selectedTokensIds, setSelectedTokensIds] = useState<TokenId[]>()

  // TODO: The props of WalletTransactionsList change on every render due to the map function.
  // This needs to be improved because we perform heavy computations to transform Tanstack data to display transactions.
  // We could try storing the filtering criteria in Redux instead of prop drilling.

  return (
    <UnlockedWalletPage
      title={t('Transfers')}
      subtitle={t('Browse your transaction history. Execute new transfers easily.')}
      className={className}
      BottomComponent={
        <FilterPanelContainer>
          <FiltersPanel
            selectedAddresses={selectedAddresses}
            setSelectedAddresses={setSelectedAddresses}
            selectedDirections={selectedDirections}
            setSelectedDirections={setSelectedDirections}
            selectedTokensIds={selectedTokensIds}
            setSelectedTokensIds={setSelectedTokensIds}
          />
        </FilterPanelContainer>
      }
    >
      <StyledUnlockedWalletPanel top bottom backgroundColor="background1">
        <WalletTransactionsList
          addressHashes={map(selectedAddresses, 'hash')}
          directions={map(selectedDirections, 'value')}
          assetIds={selectedTokensIds}
        />
      </StyledUnlockedWalletPanel>
    </UnlockedWalletPage>
  )
}

export default TransfersPage

const FilterPanelContainer = styled.div`
  width: 100%;
  display: flex;
  z-index: 1;
`

const StyledUnlockedWalletPanel = styled(UnlockedWalletPanel)`
  flex: 1;
`
