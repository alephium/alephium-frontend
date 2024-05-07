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

import { AddressHash, Asset, CURRENCIES, NFT, tokenIsUnknown, UnknownAsset } from '@alephium/shared'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { fadeIn } from '@/animations'
import {
  useAddressesFlattenKnownFungibleTokens,
  useAddressesFlattenNfts,
  useAddressesFlattenUnknownTokens,
  useAddressesWithSomeBalance
} from '@/api/apiHooks'
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
import { deviceBreakPoints } from '@/style/globalStyles'

interface AssetsListProps {
  className?: string
  addressHashes?: AddressHash[]
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
  addressHashes,
  tokensTabTitle,
  unknownTokensTabTitle,
  nftsTabTitle,
  maxHeightInPx,
  nftColumns
}: AssetsListProps) => {
  const { t } = useTranslation()

  const { data: allAddresses } = useAddressesWithSomeBalance()
  const usedAddressHashes = addressHashes && addressHashes.length > 0 ? addressHashes : allAddresses.map((a) => a.hash)

  const { data: unknownTokens } = useAddressesFlattenUnknownTokens(usedAddressHashes)

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
              <TokensList
                addressHashes={usedAddressHashes}
                isExpanded={isExpanded || !maxHeightInPx}
                onExpand={handleButtonClick}
              />
            ),
            nfts: (
              <NFTsList
                addressHashes={usedAddressHashes}
                isExpanded={isExpanded || !maxHeightInPx}
                onExpand={handleButtonClick}
                nftColumns={nftColumns}
              />
            ),
            unknownTokens: (
              <UnknownTokensList
                addressHashes={usedAddressHashes}
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

const TokensList = ({ className, addressHashes, isExpanded, onExpand }: AssetsListProps) => {
  const { data: knownFungibleTokens, isPending } = useAddressesFlattenKnownFungibleTokens(addressHashes)

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {knownFungibleTokens.map((asset) => (
          <TokenListRow asset={asset} isExpanded={isExpanded} key={asset.id} />
        ))}
        {isPending && (
          <TableRow>
            <SkeletonLoader height="37.5px" />
          </TableRow>
        )}
      </motion.div>

      {!isExpanded && knownFungibleTokens.length > 3 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
  )
}

const UnknownTokensList = ({ className, addressHashes, isExpanded, onExpand }: AssetsListProps) => {
  const { data: unknownTokens } = useAddressesFlattenUnknownTokens(addressHashes)

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {unknownTokens.map((asset) => (
          <TokenListRow asset={asset} isExpanded={isExpanded} key={asset.id} />
        ))}
      </motion.div>

      {!isExpanded && unknownTokens.length > 3 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
  )
}

interface TokenListRowProps {
  asset: Asset | UnknownAsset
  isExpanded: AssetsListProps['isExpanded']
}

const TokenListRow = ({ asset, isExpanded }: TokenListRowProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const isTokenUnknown = tokenIsUnknown(asset)
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)

  return (
    <TableRow key={asset.id} role="row" tabIndex={isExpanded ? 0 : -1}>
      <TokenRow>
        <AssetLogoStyled assetId={asset.id} assetImageUrl={asset.logoURI} size={30} assetName={asset.name} />
        <NameColumn>
          <TokenName>
            {asset.name ?? (
              <HashEllipsed hash={asset.id} tooltipText={t('Copy token hash')} disableCopy={!isExpanded} />
            )}
            {!isTokenUnknown && asset.verified === false && (
              <InfoIcon data-tooltip-id="default" data-tooltip-content={t('No metadata')}>
                i
              </InfoIcon>
            )}
          </TokenName>
          {asset.symbol && <TokenSymbol>{asset.symbol}</TokenSymbol>}
        </NameColumn>
        <TableCellAmount>
          <TokenAmount
            value={asset.balance}
            suffix={asset.symbol}
            decimals={asset.decimals}
            isUnknownToken={!asset.symbol}
          />
          {asset.lockedBalance > 0 && (
            <AmountSubtitle>
              {`${t('Available')}: `}
              <Amount
                value={asset.balance - asset.lockedBalance}
                suffix={asset.symbol}
                color={theme.font.tertiary}
                decimals={asset.decimals}
                isUnknownToken={!asset.symbol}
              />
            </AmountSubtitle>
          )}
          {!asset.symbol && <AmountSubtitle>{t('Raw amount')}</AmountSubtitle>}
          {!isTokenUnknown && asset.worth !== undefined && (
            <Price>
              <Amount value={asset.worth} isFiat suffix={CURRENCIES[fiatCurrency].symbol} />
            </Price>
          )}
        </TableCellAmount>
      </TokenRow>
    </TableRow>
  )
}

const NFTsList = ({ className, addressHashes, isExpanded, onExpand, nftColumns }: AssetsListProps) => {
  const { t } = useTranslation()
  const { data: nfts, isPending } = useAddressesFlattenNfts(addressHashes)
  const [selectedNFTId, setSelectedNFTId] = useState<NFT['id']>()

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {isPending ? (
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
  grid-template-columns: repeat(${({ columns }) => columns ?? 5}, 1fr);
  grid-auto-flow: initial;
  gap: 25px;
  padding: 15px;
  border-radius: 0 0 12px 12px;

  ${({ columns }) =>
    !columns &&
    css`
      @media ${deviceBreakPoints.desktop} {
        grid-template-columns: repeat(4, 1fr);
      }
    `}
`
