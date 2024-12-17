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

import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import HashEllipsed from '@/components/HashEllipsed'
import { AddressModalBaseProp } from '@/features/modals/modalTypes'
import { useAppSelector } from '@/hooks/redux'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { openInWebBrowser } from '@/utils/misc'

const Header = ({ addressHash }: AddressModalBaseProp) => {
  const { t } = useTranslation()
  const explorerUrl = useAppSelector((state) => state.network.settings.explorerUrl)

  const handleExplorerLinkClick = () => openInWebBrowser(`${explorerUrl}/addresses/${addressHash}`)

  return (
    <HeaderStyled>
      <LeftSide>
        <AddressColorIndicator addressHash={addressHash} size={26} />
        <TitleBadge addressHash={addressHash} />
      </LeftSide>
      <ExplorerButton role="secondary" transparent short onClick={handleExplorerLinkClick}>
        {t('Show in explorer')} ↗
      </ExplorerButton>
    </HeaderStyled>
  )
}

export default Header

const TitleBadge = ({ addressHash }: AddressModalBaseProp) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  return (
    <>
      <Title>
        <AddressBadgeStyled addressHash={addressHash} hideColorIndication disableCopy={!!address.label} truncate />
        {address.label && <TitleAddressHash hash={addressHash} />}
      </Title>
      <Badge short color={theme.font.tertiary}>
        {t('Group')} {address.group}
      </Badge>
    </>
  )
}

const HeaderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const LeftSide = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
`

const ExplorerButton = styled(Button)`
  width: auto;
  margin-right: 30px;
`

const AddressBadgeStyled = styled(AddressBadge)`
  font-size: 16px;
  max-width: 160px;
`

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-weight: var(--fontWeight-semiBold);
`

const TitleAddressHash = styled(HashEllipsed)`
  max-width: 100px;
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
`
