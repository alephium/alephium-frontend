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

import { AddressHash } from '@alephium/shared'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSortTokensByWorth } from '@/api/addressesTokensPricesDataHooks'
import AddressBadge from '@/components/AddressBadge'
import AssetBadge from '@/components/AssetBadge'
import Badge from '@/components/Badge'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import { useAppSelector } from '@/hooks/redux'
import { makeSelectAddressesTokens, selectAddressByHash } from '@/storage/addresses/addressesSelectors'

interface SelectOptionAddressProps {
  addressHash: AddressHash
  isSelected?: boolean
  className?: string
}

const SelectOptionAddress = ({ addressHash, isSelected, className }: SelectOptionAddressProps) => {
  const { t } = useTranslation()
  const selectAddressesTokens = useMemo(makeSelectAddressesTokens, [])
  const assets = useAppSelector((s) => selectAddressesTokens(s, addressHash))
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  const knownAssetsWithBalance = useSortTokensByWorth(assets.filter((a) => a.balance > 0 && a.name))
  const unknownAssetsNb = assets.filter((a) => a.balance > 0 && !a.name).length
  const showAssetList = knownAssetsWithBalance.length > 0 || unknownAssetsNb > 0

  return (
    <SelectOptionItemContent
      className={className}
      displaysCheckMarkWhenSelected
      isSelected={isSelected}
      contentDirection="column"
      MainContent={
        <Header>
          <AddressBadgeContainer>
            <AddressBadgeStyled addressHash={addressHash} disableA11y truncate appendHash />
          </AddressBadgeContainer>
          <Group>
            {t('Group')} {address?.group}
          </Group>
        </Header>
      }
      SecondaryContent={
        showAssetList ? (
          <AssetList>
            {knownAssetsWithBalance.map((a) => (
              <AssetBadge key={a.id} assetId={a.id} amount={a.balance} withBackground />
            ))}
            {unknownAssetsNb > 0 && <Badge compact>+ {unknownAssetsNb}</Badge>}
          </AssetList>
        ) : undefined
      }
    />
  )
}

export default SelectOptionAddress

const Header = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
`

const Group = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-weight: 400;
  display: flex;
  flex-shrink: 0;
`

const AddressBadgeContainer = styled.div`
  flex: 1;
  min-width: 0;
`

const AddressBadgeStyled = styled(AddressBadge)`
  font-size: 17px;
  max-width: 70%;
`

const AssetList = styled.div`
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  align-items: center;
`
