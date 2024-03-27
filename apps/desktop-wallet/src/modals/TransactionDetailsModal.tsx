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

import { addApostrophes, AddressHash, NFT } from '@alephium/shared'
import { partition } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import DataRow from '@/components/DataList'
import ExpandableSection from '@/components/ExpandableSection'
import HashEllipsed from '@/components/HashEllipsed'
import IOList from '@/components/IOList'
import NFTThumbnail from '@/components/NFTThumbnail'
import Tooltip from '@/components/Tooltip'
import { useAppSelector } from '@/hooks/redux'
import { useTransactionUI } from '@/hooks/useTransactionUI'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import { ModalHeader } from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import SideModal from '@/modals/SideModal'
import { selectAddressIds } from '@/storage/addresses/addressesSelectors'
import { AddressConfirmedTransaction } from '@/types/transactions'
import { formatDateForDisplay, openInWebBrowser } from '@/utils/misc'
import { getTransactionInfo } from '@/utils/transactions'

interface TransactionDetailsModalProps {
  transaction: AddressConfirmedTransaction
  onClose: () => void
}

const TransactionDetailsModal = ({ transaction, onClose }: TransactionDetailsModalProps) => {
  const { t } = useTranslation()
  const explorerUrl = useAppSelector((state) => state.network.settings.explorerUrl)
  const allNFTs = useAppSelector((s) => s.nfts.entities)
  const internalAddressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const theme = useTheme()
  const { assets, direction, lockTime, infoType } = getTransactionInfo(transaction)
  const { label, Icon } = useTransactionUI({ infoType, isFailedScriptTx: !transaction.scriptExecutionOk })

  const isMoved = infoType === 'move'

  const [selectedAddressHash, setSelectedAddressHash] = useState<AddressHash>()

  const handleShowTxInExplorer = () => openInWebBrowser(`${explorerUrl}/#/transactions/${transaction.hash}`)

  const handleShowAddress = (addressHash: AddressHash) =>
    internalAddressHashes.includes(addressHash)
      ? setSelectedAddressHash(addressHash)
      : openInWebBrowser(`${explorerUrl}/addresses/${addressHash}`)

  const [tokensWithSymbol, tokensWithoutSymbol] = partition(assets, (asset) => !!asset.symbol)
  const [nfts, unknownTokens] = partition(tokensWithoutSymbol, (token) => !!allNFTs[token.id])
  const nftsData = nfts.map((nft) => allNFTs[nft.id] as NFT)

  return (
    <SideModal onClose={onClose} title={t('Transaction details')}>
      <Header>
        <AmountWrapper tabIndex={0}>
          {tokensWithSymbol.map(({ id, amount, decimals, symbol }) => (
            <AmountContainer key={id}>
              <Amount
                tabIndex={0}
                value={amount}
                decimals={decimals}
                suffix={symbol}
                highlight={!isMoved}
                showPlusMinus={!isMoved}
              />
            </AmountContainer>
          ))}
        </AmountWrapper>
        <HeaderInfo>
          <Direction>
            <Icon size={14} />
            {label}
          </Direction>
          <FromIn>
            {
              {
                in: t('from'),
                out: t('to'),
                swap: t('between')
              }[direction]
            }
          </FromIn>
          {(direction === 'in' || direction === 'out') && (
            <IOList
              currentAddress={transaction.address.hash}
              isOut={direction === 'out'}
              outputs={transaction.outputs}
              inputs={transaction.inputs}
              timestamp={transaction.timestamp}
            />
          )}
          {direction === 'swap' && (
            <>
              <AddressBadgeStyled addressHash={transaction.address.hash} truncate withBorders />
              <FromIn>{t('and')}</FromIn>
              <SwapPartnerAddress>
                <IOList
                  currentAddress={transaction.address.hash}
                  isOut={false}
                  outputs={transaction.outputs}
                  inputs={transaction.inputs}
                  timestamp={transaction.timestamp}
                  linkToExplorer
                />
              </SwapPartnerAddress>
            </>
          )}
        </HeaderInfo>
        <ActionLink onClick={handleShowTxInExplorer} withBackground>
          {t('Show in explorer')} ↗
        </ActionLink>
      </Header>
      <Details role="table">
        {direction !== 'swap' && (
          <>
            <DataRow label={t('Transaction hash')}>
              <TransactionHash onClick={handleShowTxInExplorer}>
                <HashEllipsed hash={transaction.hash} tooltipText={t('Copy hash')} />
              </TransactionHash>
            </DataRow>
            <DataRow label={t('From')}>
              {direction === 'out' ? (
                <AddressList>
                  <ActionLinkStyled
                    onClick={() => handleShowAddress(transaction.address.hash)}
                    key={transaction.address.hash}
                  >
                    <AddressBadge addressHash={transaction.address.hash} truncate withBorders />
                  </ActionLinkStyled>
                </AddressList>
              ) : (
                <IOList
                  currentAddress={transaction.address.hash}
                  isOut={false}
                  outputs={transaction.outputs}
                  inputs={transaction.inputs}
                  timestamp={transaction.timestamp}
                  linkToExplorer
                />
              )}
            </DataRow>
            <DataRow label={t('To')}>
              {direction !== 'out' ? (
                <AddressList>
                  <ActionLinkStyled
                    onClick={() => handleShowAddress(transaction.address.hash)}
                    key={transaction.address.hash}
                  >
                    <AddressBadge addressHash={transaction.address.hash} withBorders />
                  </ActionLinkStyled>
                </AddressList>
              ) : (
                <IOList
                  currentAddress={transaction.address.hash}
                  isOut={direction === 'out'}
                  outputs={transaction.outputs}
                  inputs={transaction.inputs}
                  timestamp={transaction.timestamp}
                  linkToExplorer
                />
              )}
            </DataRow>
          </>
        )}
        <DataRow label={t('Status')}>
          {transaction.scriptExecutionOk ? (
            <Badge color={theme.global.valid}>
              <span tabIndex={0}>{t('Confirmed')}</span>
            </Badge>
          ) : (
            <Badge color={theme.global.alert}>
              <span tabIndex={0}>{t('Script execution failed')}</span>
            </Badge>
          )}
        </DataRow>
        <DataRow label={t('Timestamp')}>
          <span tabIndex={0}>{formatDateForDisplay(transaction.timestamp)}</span>
        </DataRow>
        {lockTime && (
          <DataRow label={lockTime < new Date() ? t('Unlocked at') : t('Unlocks at')}>
            <span tabIndex={0}>{formatDateForDisplay(lockTime)}</span>
          </DataRow>
        )}
        <DataRow label={t('Fee')}>
          <Amount tabIndex={0} value={BigInt(transaction.gasAmount) * BigInt(transaction.gasPrice)} fullPrecision />
        </DataRow>
        <DataRow label={t('Total value')}>
          <Amounts>
            {tokensWithSymbol.map(({ id, amount, decimals, symbol }) => (
              <AmountContainer key={id}>
                <Amount
                  tabIndex={0}
                  value={amount}
                  fullPrecision
                  decimals={decimals}
                  suffix={symbol}
                  isUnknownToken={!symbol}
                  highlight={!isMoved}
                  showPlusMinus={!isMoved}
                />
                {!symbol && <TokenHash hash={id} />}
              </AmountContainer>
            ))}
          </Amounts>
        </DataRow>
        {nftsData.length > 0 && (
          <DataRow label={t('NFTs')}>
            <NFTThumbnails>
              {nftsData.map((nft) => (
                <NFTThumbnail nft={nft} key={nft.id} />
              ))}
            </NFTThumbnails>
          </DataRow>
        )}
        {unknownTokens.length > 0 && (
          <DataRow label={t('Unknown tokens')}>
            <Amounts>
              {unknownTokens.map(({ id, amount, symbol }) => (
                <AmountContainer key={id}>
                  <Amount tabIndex={0} value={amount} isUnknownToken={!symbol} highlight />
                  {!symbol && <TokenHash hash={id} />}
                </AmountContainer>
              ))}
            </Amounts>
          </DataRow>
        )}
        <ExpandableSectionStyled sectionTitleClosed={t('Click to see more')} sectionTitleOpen={t('Click to see less')}>
          <DataRow label={t('Gas amount')}>
            <span tabIndex={0}>{addApostrophes(transaction.gasAmount.toString())}</span>
          </DataRow>
          <DataRow label={t('Gas price')}>
            <Amount tabIndex={0} value={BigInt(transaction.gasPrice)} fullPrecision />
          </DataRow>
          <DataRow label={t('Inputs')}>
            <AddressList>
              {transaction.inputs?.map(
                (input) =>
                  input.address && (
                    <ActionLinkStyled
                      key={`${input.outputRef.key}`}
                      onClick={() => handleShowAddress(input.address as string)}
                    >
                      <HashEllipsed key={`${input.outputRef.key}`} hash={input.address} />
                    </ActionLinkStyled>
                  )
              )}
            </AddressList>
          </DataRow>
          <DataRow label={t('Outputs')}>
            <AddressList>
              {transaction.outputs?.map((output) => (
                <ActionLinkStyled key={`${output.key}`} onClick={() => handleShowAddress(output.address ?? '')}>
                  <HashEllipsed key={`${output.key}`} hash={output.address} />
                </ActionLinkStyled>
              ))}
            </AddressList>
          </DataRow>
        </ExpandableSectionStyled>
      </Details>
      <Tooltip />
      <ModalPortal>
        {selectedAddressHash && (
          <AddressDetailsModal addressHash={selectedAddressHash} onClose={() => setSelectedAddressHash(undefined)} />
        )}
      </ModalPortal>
    </SideModal>
  )
}

export default TransactionDetailsModal

const Direction = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
`

const AmountWrapper = styled.div`
  font-size: 26px;
  font-weight: var(--fontWeight-semiBold);
`

const Header = styled(ModalHeader)`
  padding: 35px;
  display: flex;
  align-items: center;
  flex-direction: column;
`

const HeaderInfo = styled.div`
  display: flex;
  gap: 8px;
  font-weight: var(--fontWeight-semiBold);
  align-items: center;
  margin-top: var(--spacing-3);
  margin-bottom: var(--spacing-5);
  max-width: 100%;
`

const FromIn = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const Details = styled.div`
  padding: var(--spacing-2) var(--spacing-3);
`

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: 28px;
`

const AddressList = styled.div`
  overflow: hidden;
`

const ActionLinkStyled = styled(ActionLink)`
  width: 100%;
  justify-content: right;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
`

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const TokenHash = styled(HashEllipsed)`
  max-width: 80px;
  color: ${({ theme }) => theme.font.primary};
`

const AddressBadgeStyled = styled(AddressBadge)`
  max-width: 200px;
`

const SwapPartnerAddress = styled.div`
  max-width: 80px;
`

const NFTThumbnails = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
`

const TransactionHash = styled(ActionLink)`
  max-width: 125px;
`
