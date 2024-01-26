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

import { AssetAmount } from '@alephium/shared'
import dayjs from 'dayjs'
import { map } from 'lodash'
import { RiExternalLinkLine } from 'react-icons/ri'
import { Link, LinkProps } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import { useAssetsMetadata } from '@/api/assets/assetsHooks'
import Amount from '@/components/Amount'
import LockTimeIcon from '@/components/LockTimeIcon'
import { smartHash } from '@/utils/strings'

import Ellipsed from './Ellipsed'
import HashEllipsed from './HashEllipsed'

interface TightLinkProps extends LinkProps {
  maxWidth: string
  text: string
  isHash?: boolean
}

export const SimpleLink: FC<LinkProps> = ({ children, ...props }) => <StyledLink {...props}>{children}</StyledLink>

export const TightLink: FC<TightLinkProps> = ({ maxWidth, text, isHash, ...props }) => (
  <div style={{ maxWidth: maxWidth, display: 'flex', overflow: 'hidden' }}>
    <StyledLink
      {...props}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      {isHash ? <HashEllipsed hash={text} /> : <Ellipsed text={text} />}
    </StyledLink>
  </div>
)

export const TightLinkStrict: FC<TightLinkProps> = ({ maxWidth, text, ...props }) => (
  <div style={{ maxWidth: maxWidth, display: 'flex', overflow: 'hidden' }}>
    <StyledLink {...props} data-tooltip-id="default" data-tooltip-content={text}>
      {smartHash(text)}
    </StyledLink>
  </div>
)

interface AddressLinkProps {
  maxWidth?: string
  address: string
  txHashRef?: string
  amounts?: AssetAmount[]
  lockTime?: number
  flex?: boolean
  className?: string
}

const AddressLinkBase = ({
  maxWidth = 'auto',
  address,
  txHashRef,
  amounts,
  lockTime,
  flex,
  className
}: AddressLinkProps) => {
  const theme = useTheme()
  const isLocked = lockTime && dayjs(lockTime).isAfter(dayjs())

  const assetsMetadata = useAssetsMetadata(map(amounts, 'id'))

  const renderAmount = (amount: AssetAmount) => {
    const info = assetsMetadata.fungibleTokens.find((i) => i.id === amount.id)

    return (
      <Amount
        key={amount.id}
        assetId={amount.id}
        value={amount.amount}
        suffix={info?.symbol}
        decimals={info?.decimals}
      />
    )
  }

  return (
    <div className={className}>
      <TightLink to={`/addresses/${address}`} maxWidth={maxWidth} text={address} isHash />
      {txHashRef && (
        <TxLink to={`/transactions/${txHashRef}`} data-tooltip-id="default" data-tooltip-content={txHashRef}>
          <RiExternalLinkLine size={10} />
        </TxLink>
      )}
      {isLocked && <LockIcon timestamp={lockTime} color={theme.global.highlight} />}
      {amounts !== undefined && (
        <AmountsContainer flex={flex}>
          <Amounts>{amounts.map(renderAmount)}</Amounts>
        </AmountsContainer>
      )}
    </div>
  )
}

export const AddressLink = styled(AddressLinkBase)`
  padding: 3px 0;
  display: flex;

  ${({ flex }) =>
    flex &&
    css`
      align-items: center;
    `}
`

const AmountsContainer = styled.div<Pick<AddressLinkProps, 'flex'>>`
  color: ${({ theme }) => theme.font.primary};
  margin-left: 8px;
  display: flex;
  gap: 10px;
  align-items: center;
  ${({ flex }) =>
    flex &&
    css`
      flex: 1;
      justify-content: flex-end;
      text-align: right;
    `}
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const TxLink = styled(Link)`
  padding: 3px;
  background-color: ${({ theme }) => theme.bg.accent};
  display: flex;
  border-radius: 4px;
  margin-left: 4px;
`

const StyledLink = styled(Link)`
  white-space: nowrap;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.6pt;
`

const LockIcon = styled(LockTimeIcon)`
  margin-left: 5px;
`
