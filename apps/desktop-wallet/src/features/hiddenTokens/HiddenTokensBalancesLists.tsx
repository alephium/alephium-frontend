import { isFT, isNFT } from '@alephium/shared'
import { useFetchAddressHiddenTokens, useFetchToken } from '@alephium/shared-react'
import { ChevronUp, EyeOff } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import Table from '@/components/Table'
import {
  AddressFTBalancesRow,
  AddressNSTBalancesRow
} from '@/features/assetsLists/tokenBalanceRow/AddressTokenBalancesRow'
import { AddressTokenBalancesRowProps, TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'
import {
  WalletFTBalancesRow,
  WalletNSTBalancesRow
} from '@/features/assetsLists/tokenBalanceRow/WalletTokenBalancesRow'
import { AddressModalBaseProp } from '@/features/modals/modalTypes'
import { useAppSelector } from '@/hooks/redux'

export const HiddenWalletTokensBalancesListSection = () => {
  const hiddenTokenIds = useAppSelector((s) => s.hiddenTokens.hiddenTokensIds)

  return (
    <HiddenTokensBalancesListSection count={hiddenTokenIds.length}>
      <HiddenWalletTokensBalancesList />
    </HiddenTokensBalancesListSection>
  )
}

export const HiddenAddressTokensBalancesListSection = ({ addressHash }: AddressModalBaseProp) => {
  const { data: hiddenTokenIds } = useFetchAddressHiddenTokens(addressHash)

  return (
    <HiddenTokensBalancesListSection count={hiddenTokenIds?.length ?? 0}>
      <HiddenAddressTokensBalancesList addressHash={addressHash} />
    </HiddenTokensBalancesListSection>
  )
}

interface HiddenTokensBalancesListSectionProps {
  count: number
  children: ReactNode
}

const HiddenTokensBalancesListSection = ({ count, children }: HiddenTokensBalancesListSectionProps) => {
  const { t } = useTranslation()

  const [showHiddenTokensBalancesList, setShowHiddenTokensBalancesList] = useState(false)

  const toggleHiddenTokensBalancesList = () => setShowHiddenTokensBalancesList((prev) => !prev)

  if (count === 0) return null

  return (
    <>
      <ButtonStyled
        Icon={showHiddenTokensBalancesList ? ChevronUp : EyeOff}
        role="secondary"
        onClick={toggleHiddenTokensBalancesList}
        short
      >
        {showHiddenTokensBalancesList ? t('Close hidden assets list') : t('nb_of_hidden_assets', { count })}
      </ButtonStyled>
      {showHiddenTokensBalancesList && children}
    </>
  )
}

const HiddenWalletTokensBalancesList = () => {
  const hiddenTokenIds = useAppSelector((s) => s.hiddenTokens.hiddenTokensIds)

  return (
    <TableStyled>
      {hiddenTokenIds.map((tokenId) => (
        <HiddenWalletTokenBalancesRow tokenId={tokenId} key={tokenId} />
      ))}
    </TableStyled>
  )
}

const HiddenAddressTokensBalancesList = ({ addressHash }: AddressModalBaseProp) => {
  const { data: hiddenTokenIds } = useFetchAddressHiddenTokens(addressHash)

  if (!hiddenTokenIds?.length) return null

  return (
    <TableStyled>
      {hiddenTokenIds.map((tokenId) => (
        <HiddenAddressTokenBalancesRow addressHash={addressHash} tokenId={tokenId} key={tokenId} />
      ))}
    </TableStyled>
  )
}

const HiddenAddressTokenBalancesRow = ({ addressHash, tokenId }: AddressTokenBalancesRowProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token) return null

  return isFT(token) ? (
    <AddressFTBalancesRow tokenId={tokenId} addressHash={addressHash} />
  ) : !isNFT(token) ? (
    <AddressNSTBalancesRow tokenId={tokenId} addressHash={addressHash} />
  ) : null
}

const HiddenWalletTokenBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token) return null

  return isFT(token) ? (
    <WalletFTBalancesRow tokenId={tokenId} />
  ) : !isNFT(token) ? (
    <WalletNSTBalancesRow tokenId={tokenId} key={tokenId} />
  ) : null
}

const ButtonStyled = styled(Button)`
  margin: var(--spacing-4) auto;
`

const TableStyled = styled(Table)`
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  padding-left: var(--spacing-3);
  padding-right: var(--spacing-3);
  background-color: ${({ theme }) => theme.bg.primary};
`
