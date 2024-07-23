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

import { AddressHash, CURRENCIES, NFT } from '@alephium/shared'
import { motion } from 'framer-motion'
import { orderBy } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { fadeIn } from '@/animations'
import { useAddressesTokensBalances } from '@/api/addressesBalancesDataHooks'
import {
  useAddressesListedFungibleTokens,
  useAddressesUnlistedFungibleTokens
} from '@/api/addressesFungibleTokensInfoDataHooks'
import { useAddressesTokensWorth } from '@/api/addressesFungibleTokensPricesDataHooks'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import FocusableContent from '@/components/FocusableContent'
import HashEllipsed from '@/components/HashEllipsed'
import NFTCard from '@/components/NFTCard'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TabItem } from '@/components/TabBar'
import { ExpandableTable, ExpandRow, TableRow } from '@/components/Table'
import TableCellAmount from '@/components/TableCellAmount'
import TableTabBar from '@/components/TableTabBar'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import NFTDetailsModal from '@/modals/NFTDetailsModal'
import {
  makeSelectAddressesCheckedUnknownTokens,
  makeSelectAddressesNFTs,
  selectIsStateUninitialized
} from '@/storage/addresses/addressesSelectors'
import { deviceBreakPoints } from '@/style/globalStyles'

interface AssetsListProps {
  className?: string
  addressHash?: AddressHash
  tokensTabTitle?: string
  unknownTokensTabTitle?: string
  nftsTabTitle?: string
  showTokens?: boolean
  showNfts?: boolean
  isExpanded?: boolean
  onExpand?: () => void
  maxHeightInPx?: number
  nftColumns?: number
}

const AssetsList = ({
  className,
  addressHash,
  tokensTabTitle,
  unknownTokensTabTitle,
  nftsTabTitle,
  maxHeightInPx,
  nftColumns
}: AssetsListProps) => {
  const { t } = useTranslation()
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHash))

  const [tabs, setTabs] = useState([
    { value: 'tokens', label: tokensTabTitle ?? '💰 ' + t('Tokens') },
    { value: 'nfts', label: nftsTabTitle ?? '🖼️ ' + t('NFTs') }
  ])
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])
  const [isExpanded, setIsExpanded] = useState(false)

  const handleButtonClick = () => setIsExpanded(!isExpanded)

  useEffect(() => {
    if (unknownTokens.length > 0 && tabs.length === 2) {
      setTabs([...tabs, { value: 'unknownTokens', label: unknownTokensTabTitle ?? '❔' + t('Unknown tokens') }])
    }
  }, [t, tabs, unknownTokens.length, unknownTokensTabTitle])

  return (
    <FocusableContent className={className} isFocused={isExpanded} onClose={() => setIsExpanded(false)}>
      <ExpandableTable isExpanded={isExpanded} maxHeightInPx={maxHeightInPx}>
        <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
        {
          {
            tokens: (
              <TokensBalancesList
                addressHash={addressHash}
                isExpanded={isExpanded || !maxHeightInPx}
                onExpand={handleButtonClick}
              />
            ),
            nfts: (
              <NFTsList
                addressHash={addressHash}
                isExpanded={isExpanded || !maxHeightInPx}
                onExpand={handleButtonClick}
                nftColumns={nftColumns}
              />
            ),
            unknownTokens: (
              <UnknownTokensBalancesList
                addressHash={addressHash}
                isExpanded={isExpanded || !maxHeightInPx}
                onExpand={handleButtonClick}
              />
            )
          }[currentTab.value]
        }
      </ExpandableTable>
    </FocusableContent>
  )
}

const TokensBalancesList = ({ className, addressHash, isExpanded, onExpand }: AssetsListProps) => {
  const { data: sortedTokenIds, isLoading } = useSortedAddressesFungibleTokensIds(addressHash)

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {sortedTokenIds.map((tokenId) => (
          <TokenBalancesRow tokenId={tokenId} addressHash={addressHash} isExpanded={isExpanded} key={tokenId} />
        ))}
        {isLoading && (
          <TableRow>
            <SkeletonLoader height="37.5px" />
          </TableRow>
        )}
      </motion.div>

      {!isExpanded && sortedTokenIds.length > 3 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
  )
}

const useSortedAddressesFungibleTokensIds = (addressHash?: AddressHash) => {
  const { data: addressesTokensWorth, isLoading: isLoadingTokensWirth } = useAddressesTokensWorth(addressHash)
  const { data: addressesListedFungibleTokens, isLoading: isLoadingListedFungibleTokens } =
    useAddressesListedFungibleTokens(addressHash)
  const { data: addressesUnlistedFungibleTokens, isLoading: isLoadingUnlistedFungibleTokens } =
    useAddressesUnlistedFungibleTokens(addressHash)

  const sortedTokenIds = useMemo(
    () =>
      [
        ...orderBy(
          addressesListedFungibleTokens,
          [(t) => addressesTokensWorth[t.id] ?? -1, (t) => t.name.toLowerCase()],
          ['desc', 'asc']
        ),
        ...orderBy(addressesUnlistedFungibleTokens, [(t) => t.name.toLowerCase(), 'id'], ['asc', 'asc'])
      ].map((token) => token.id),
    [addressesListedFungibleTokens, addressesTokensWorth, addressesUnlistedFungibleTokens]
  )

  return {
    data: sortedTokenIds,
    isLoading: isLoadingTokensWirth || isLoadingListedFungibleTokens || isLoadingUnlistedFungibleTokens
  }
}

const UnknownTokensBalancesList = ({ className, addressHash, isExpanded, onExpand }: AssetsListProps) => {
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHash))

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {unknownTokens.map((asset) => (
          <TokenBalancesRow tokenId={asset.id} addressHash={addressHash} isExpanded={isExpanded} key={asset.id} />
        ))}
      </motion.div>

      {!isExpanded && unknownTokens.length > 3 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
  )
}

interface TokenBalancesRowProps {
  tokenId: string
  isExpanded: AssetsListProps['isExpanded']
  addressHash?: AddressHash
}

const TokenBalancesRow = ({ tokenId, addressHash, isExpanded }: TokenBalancesRowProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)

  const { balances, logoUri, info, worth, isUnlisted, isLoading } = useAddressesToken(tokenId, addressHash)

  if (!balances) return null

  return (
    <TableRow key={tokenId} role="row" tabIndex={isExpanded ? 0 : -1}>
      <TokenRow>
        <AssetLogoStyled assetImageUrl={logoUri} size={30} assetName={info?.name} />
        <NameColumn>
          <TokenName>
            {info?.name ?? <HashEllipsed hash={tokenId} tooltipText={t('Copy token hash')} disableCopy={!isExpanded} />}
            {isUnlisted && (
              <InfoIcon data-tooltip-id="default" data-tooltip-content={t('No metadata')}>
                i
              </InfoIcon>
            )}
          </TokenName>
          {info?.symbol && <TokenSymbol>{info.symbol}</TokenSymbol>}
        </NameColumn>
        <TableCellAmount>
          {isLoading ? (
            <SkeletonLoader height="20px" width="30%" />
          ) : (
            <>
              <TokenAmount
                value={balances.balance}
                suffix={info?.symbol}
                decimals={info?.decimals}
                isUnknownToken={!info?.symbol}
              />
              {balances.lockedBalance > 0 && (
                <AmountSubtitle>
                  {`${t('Available')}: `}
                  <Amount
                    value={balances.balance - balances.lockedBalance}
                    suffix={info?.symbol}
                    color={theme.font.tertiary}
                    decimals={info?.decimals}
                    isUnknownToken={!info?.symbol}
                  />
                </AmountSubtitle>
              )}
              {!info?.symbol && <AmountSubtitle>{t('Raw amount')}</AmountSubtitle>}
              {worth !== undefined && (
                <Price>
                  <Amount value={worth} isFiat suffix={CURRENCIES[fiatCurrency].symbol} />
                </Price>
              )}
            </>
          )}
        </TableCellAmount>
      </TokenRow>
    </TableRow>
  )
}

const useAddressesToken = (tokenId: string, addressHash?: AddressHash) => {
  const { data: addressesTokensBalances, isLoading: isLoadingTokensBalances } = useAddressesTokensBalances(addressHash)
  const { data: addressesTokensWorth, isLoading: isLoadingTokensWorth } = useAddressesTokensWorth(addressHash)
  const { data: addressesListedFungibleTokens, isLoading: isLoadingListedFungibleTokens } =
    useAddressesListedFungibleTokens(addressHash)
  const { data: addressesUnlistedFungibleTokens, isLoading: isLoadingUnlistedFungibleTokens } =
    useAddressesUnlistedFungibleTokens(addressHash)

  const listedTokenInfo = addressesListedFungibleTokens.find((token) => token.id === tokenId)
  const unlistedTokenInfo = addressesUnlistedFungibleTokens.find((token) => token.id === tokenId)

  return {
    info: listedTokenInfo ?? unlistedTokenInfo,
    logoUri: listedTokenInfo?.logoURI,
    isUnlisted: !!unlistedTokenInfo,
    balances: addressesTokensBalances[tokenId],
    worth: addressesTokensWorth[tokenId],
    isLoading:
      isLoadingTokensBalances ||
      isLoadingTokensWorth ||
      isLoadingListedFungibleTokens ||
      isLoadingUnlistedFungibleTokens
  }
}

const NFTsList = ({ className, addressHash, isExpanded, onExpand, nftColumns }: AssetsListProps) => {
  const { t } = useTranslation()
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const isLoadingNFTs = useAppSelector((s) => s.nfts.loading)
  const isLoadingTokenTypes = useAppSelector((s) => s.fungibleTokens.loadingTokenTypes)
  const [selectedNFTId, setSelectedNFTId] = useState<NFT['id']>()

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {isLoadingNFTs || isLoadingTokenTypes || stateUninitialized ? (
          <NFTList>
            <SkeletonLoader height="205px" />
            <SkeletonLoader height="205px" />
            <SkeletonLoader height="205px" />
            <SkeletonLoader height="205px" />
          </NFTList>
        ) : (
          <NFTList role="row" tabIndex={isExpanded ? 0 : -1} columns={nftColumns}>
            {nfts.map((nft) => (
              <NFTCard key={nft.id} nftId={nft.id} onClick={() => setSelectedNFTId(nft.id)} />
            ))}
            {nfts.length === 0 && <PlaceholderText>{t('No NFTs found.')}</PlaceholderText>}
          </NFTList>
        )}
      </motion.div>

      {!isExpanded && nfts.length > 4 && onExpand && <ExpandRow onClick={onExpand} />}

      <ModalPortal>
        {selectedNFTId && <NFTDetailsModal nftId={selectedNFTId} onClose={() => setSelectedNFTId(undefined)} />}
      </ModalPortal>
    </>
  )
}

export default styled(AssetsList)`
  margin-bottom: 45px;
`

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`

const AssetLogoStyled = styled(AssetLogo)`
  margin-right: 20px;
`

const TokenName = styled(Truncate)`
  display: flex;
  font-size: 14px;
  font-weight: var(--fontWeight-medium);
  gap: 5px;
  align-items: center;
  width: 200px;
`

const TokenSymbol = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 12px;
  width: 200px;
`

const InfoIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 14px;
  width: 14px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.tertiary};
  background-color: ${({ theme }) => theme.bg.background2};
  border-radius: 50%;
  cursor: default;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const TokenAmount = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
`

const AmountSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 10px;
`

const Price = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.secondary};
`

const NameColumn = styled(Column)`
  margin-right: 50px;
`

const PlaceholderText = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const NFTList = styled(TableRow)<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns ?? 5}, minmax(0, 1fr));
  grid-auto-flow: initial;
  gap: 25px;
  padding: 15px;
  border-radius: 0 0 12px 12px;

  > * {
    width: 100%;
  }

  ${({ columns }) =>
    !columns &&
    css`
      @media ${deviceBreakPoints.desktop} {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    `}
`
