/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { colord } from 'colord'
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
  background: ${({ theme }) => `linear-gradient(to top, ${colord(theme.bg.background2).toHex()} 25%, transparent)`};
`

const StyledUnlockedWalletPanel = styled(UnlockedWalletPanel)`
  flex: 1;
`
