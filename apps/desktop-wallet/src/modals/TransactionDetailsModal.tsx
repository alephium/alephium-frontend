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

import { addApostrophes, AddressHash, NFT, TransactionInfoType } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { partition } from 'lodash'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import DataList from '@/components/DataList'
import ExpandableSection from '@/components/ExpandableSection'
import HashEllipsed from '@/components/HashEllipsed'
import IOList from '@/components/IOList'
import NFTThumbnail from '@/components/NFTThumbnail'
import Tooltip from '@/components/Tooltip'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useTransactionUI } from '@/hooks/useTransactionUI'
import SideModal from '@/modals/SideModal'
import { selectAddressIds } from '@/storage/addresses/addressesSelectors'
import { selectConfirmedTransactionByHash } from '@/storage/transactions/transactionsSelectors'
import { formatDateForDisplay, openInWebBrowser } from '@/utils/misc'
import { getTransactionInfo } from '@/utils/transactions'

export interface TransactionDetailsModalProps {
  txHash: Transaction['hash']
  addressHash: AddressHash
}

const TransactionDetailsModal = memo(({ id, txHash, addressHash }: ModalBaseProp & TransactionDetailsModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const transaction = useAppSelector((s) => selectConfirmedTransactionByHash(s, txHash))
  const explorerUrl = useAppSelector((state) => state.network.settings.explorerUrl)
  const allNFTs = useAppSelector((s) => s.nfts.entities)
  const internalAddressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const dispatch = useAppDispatch()

  if (!transaction) return null

  const { assets, direction, lockTime, infoType } = getTransactionInfo(transaction, addressHash)
  const isMoved = infoType === 'move'

  const handleShowTxInExplorer = () => openInWebBrowser(`${explorerUrl}/#/transactions/${txHash}`)

  const handleShowAddress = (addressHash: AddressHash) =>
    internalAddressHashes.includes(addressHash)
      ? dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
      : openInWebBrowser(`${explorerUrl}/addresses/${addressHash}`)

  const openNFTDetailsModal = (nftId: NFT['id']) => dispatch(openModal({ name: 'NFTDetailsModal', props: { nftId } }))

  const onClose = () => dispatch(closeModal({ id }))

  const [tokensWithSymbol, tokensWithoutSymbol] = partition(assets, (asset) => !!asset.symbol)
  const [nfts, unknownTokens] = partition(tokensWithoutSymbol, (token) => !!allNFTs[token.id])
  const nftsData = nfts.map((nft) => allNFTs[nft.id] as NFT)

  return (
    <SideModal onClose={onClose} title={t('Transaction details')}>
      <Summary>
        <SummaryContent>
          <TransactionType infoType={infoType} isFailedScriptTx={transaction.scriptExecutionOk} />
          <AmountWrapper tabIndex={0}>
            {tokensWithSymbol.map(({ id, amount }) => (
              <AmountContainer key={id}>
                <Amount tokenId={id} tabIndex={0} value={amount} highlight={!isMoved} showPlusMinus={!isMoved} />
              </AmountContainer>
            ))}
          </AmountWrapper>
          <TransactionDirectionInfo>
            <AddressesInvolved>
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
                  currentAddress={addressHash}
                  isOut={direction === 'out'}
                  outputs={transaction.outputs}
                  inputs={transaction.inputs}
                  timestamp={transaction.timestamp}
                  truncate
                />
              )}
              {direction === 'swap' && (
                <>
                  <AddressBadge addressHash={addressHash} truncate withBorders isShort />
                  <FromIn>{t('and')}</FromIn>
                  <SwapPartnerAddress>
                    <IOList
                      currentAddress={addressHash}
                      isOut={false}
                      outputs={transaction.outputs}
                      inputs={transaction.inputs}
                      timestamp={transaction.timestamp}
                      linkToExplorer
                    />
                  </SwapPartnerAddress>
                </>
              )}
            </AddressesInvolved>
          </TransactionDirectionInfo>
          <ActionLink onClick={handleShowTxInExplorer} withBackground>
            {t('Show in explorer')} ↗
          </ActionLink>
        </SummaryContent>
      </Summary>
      <Details role="table">
        <DataList>
          {direction !== 'swap' && (
            <>
              <DataList.Row label={t('Transaction hash')}>
                <TransactionHash onClick={handleShowTxInExplorer}>
                  <HashEllipsed hash={transaction.hash} tooltipText={t('Copy hash')} />
                </TransactionHash>
              </DataList.Row>
              <DataList.Row label={t('From')}>
                {direction === 'out' ? (
                  <ActionLinkStyled onClick={() => handleShowAddress(addressHash)}>
                    <AddressBadge addressHash={addressHash} truncate withBorders />
                  </ActionLinkStyled>
                ) : (
                  <IOList
                    currentAddress={addressHash}
                    isOut={false}
                    outputs={transaction.outputs}
                    inputs={transaction.inputs}
                    timestamp={transaction.timestamp}
                    linkToExplorer
                  />
                )}
              </DataList.Row>
              <DataList.Row label={t('To')}>
                {direction !== 'out' ? (
                  <ActionLinkStyled onClick={() => handleShowAddress(addressHash)} key={addressHash}>
                    <AddressBadge addressHash={addressHash} truncate withBorders />
                  </ActionLinkStyled>
                ) : (
                  <IOList
                    currentAddress={addressHash}
                    isOut={direction === 'out'}
                    outputs={transaction.outputs}
                    inputs={transaction.inputs}
                    timestamp={transaction.timestamp}
                    linkToExplorer
                  />
                )}
              </DataList.Row>
            </>
          )}
          <DataList.Row label={t('Status')}>
            {transaction.scriptExecutionOk ? (
              <Badge color={theme.global.valid}>
                <span tabIndex={0}>{t('Confirmed')}</span>
              </Badge>
            ) : (
              <Badge color={theme.global.alert}>
                <span tabIndex={0}>{t('Script execution failed')}</span>
              </Badge>
            )}
          </DataList.Row>
          <DataList.Row label={t('Timestamp')}>
            <span tabIndex={0}>{formatDateForDisplay(transaction.timestamp)}</span>
          </DataList.Row>
          {lockTime && (
            <DataList.Row label={lockTime < new Date() ? t('Unlocked at') : t('Unlocks at')}>
              <span tabIndex={0}>{formatDateForDisplay(lockTime)}</span>
            </DataList.Row>
          )}
          <DataList.Row label={t('Fee')}>
            <Amount
              tokenId={ALPH.id}
              tabIndex={0}
              value={BigInt(transaction.gasAmount) * BigInt(transaction.gasPrice)}
              fullPrecision
            />
          </DataList.Row>
          <DataList.Row label={t('Total value')}>
            <Amounts>
              {tokensWithSymbol.map(({ id, amount, symbol }) => (
                <AmountContainer key={id}>
                  <Amount
                    tokenId={id}
                    tabIndex={0}
                    value={amount}
                    fullPrecision
                    highlight={!isMoved}
                    showPlusMinus={!isMoved}
                  />
                  {!symbol && <TokenHash hash={id} />}
                </AmountContainer>
              ))}
            </Amounts>
          </DataList.Row>
          {nftsData.length > 0 && (
            <DataList.Row label={t('NFTs')}>
              <NFTThumbnails>
                {nftsData.map((nft) => (
                  <NFTThumbnail nftId={nft.id} key={nft.id} onClick={() => openNFTDetailsModal(nft.id)} />
                ))}
              </NFTThumbnails>
            </DataList.Row>
          )}
          {unknownTokens.length > 0 && (
            <DataList.Row label={t('Unknown tokens')}>
              <Amounts>
                {unknownTokens.map(({ id, amount, symbol }) => (
                  <AmountContainer key={id}>
                    <Amount tokenId={id} tabIndex={0} value={amount} highlight />
                    {!symbol && <TokenHash hash={id} />}
                  </AmountContainer>
                ))}
              </Amounts>
            </DataList.Row>
          )}
        </DataList>
        <ExpandableSectionStyled sectionTitleClosed={t('Click to see more')} sectionTitleOpen={t('Click to see less')}>
          <DataList>
            <DataList.Row label={t('Gas amount')}>
              <span tabIndex={0}>{addApostrophes(transaction.gasAmount.toString())}</span>
            </DataList.Row>
            <DataList.Row label={t('Gas price')}>
              <Amount tokenId={ALPH.id} tabIndex={0} value={BigInt(transaction.gasPrice)} fullPrecision />
            </DataList.Row>
            <DataList.Row label={t('Inputs')}>
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
            </DataList.Row>
            <DataList.Row label={t('Outputs')}>
              <AddressList>
                {transaction.outputs?.map((output) => (
                  <ActionLinkStyled key={`${output.key}`} onClick={() => handleShowAddress(output.address ?? '')}>
                    <HashEllipsed key={`${output.key}`} hash={output.address} />
                  </ActionLinkStyled>
                ))}
              </AddressList>
            </DataList.Row>
          </DataList>
        </ExpandableSectionStyled>
      </Details>
      <Tooltip />
    </SideModal>
  )
})

export default TransactionDetailsModal

interface TransactionTypeProps {
  infoType: TransactionInfoType
  isFailedScriptTx: boolean
}

const TransactionType = (props: TransactionTypeProps) => {
  const { label, Icon, iconColor } = useTransactionUI(props)

  return (
    <TransactionTypeStyled short color={iconColor}>
      <Icon size={14} color={iconColor} />
      {label}
    </TransactionTypeStyled>
  )
}

const TransactionTypeStyled = styled(Badge)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-4);
`

const AmountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 26px;
  font-weight: var(--fontWeight-semiBold);
`

const Summary = styled.div`
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-1);
`

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5);
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
`

const TransactionDirectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  gap: 8px;
  font-weight: var(--fontWeight-semiBold);
  margin-top: var(--spacing-5);
  margin-bottom: var(--spacing-5);
`

const AddressesInvolved = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 80%;
`

const FromIn = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const Details = styled.div`
  padding: var(--spacing-2) var(--spacing-3);
`

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: var(--spacing-2);
`

const AddressList = styled.div`
  overflow: hidden;
`

const ActionLinkStyled = styled(ActionLink)`
  width: 100%;
  justify-content: flex-end;

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
`

const TokenHash = styled(HashEllipsed)`
  max-width: 80px;
  color: ${({ theme }) => theme.font.primary};
`

const SwapPartnerAddress = styled.div`
  max-width: 120px;
`

const NFTThumbnails = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`

const TransactionHash = styled(ActionLink)`
  max-width: 125px;
`
