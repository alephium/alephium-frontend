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

import { NFT } from '@alephium/shared'
import dayjs from 'dayjs'
import { openBrowserAsync } from 'expo-web-browser'
import { partition } from 'lodash'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import IOList from '~/components/IOList'
import Surface from '~/components/layout/Surface'
import NFTThumbnail from '~/components/NFTThumbnail'
import Row from '~/components/Row'
import BottomModal from '~/features/modals/BottomModal'
import { openModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { AddressConfirmedTransaction } from '~/types/transactions'
import { getTransactionInfo } from '~/utils/transactions'

interface TransactionModalProps {
  tx: AddressConfirmedTransaction
}

const TransactionModal = withModal<TransactionModalProps>(({ id, tx }) => {
  const explorerBaseUrl = useAppSelector((s) => s.network.settings.explorerUrl)
  const allNFTs = useAppSelector((s) => s.nfts.entities)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { direction, infoType, assets } = getTransactionInfo(tx)
  const [tokensWithSymbol, tokensWithoutSymbol] = partition(assets, (asset) => !!asset.symbol)
  const [nfts, unknownTokens] = partition(tokensWithoutSymbol, (token) => !!allNFTs[token.id])
  const nftsData = nfts.map((nft) => allNFTs[nft.id] as NFT)
  const explorerTxUrl = `${explorerBaseUrl}/transactions/${tx.hash}`
  const isOut = direction === 'out'
  const isMoved = infoType === 'move'

  const openNftGridModal = () => dispatch(openModal({ name: 'NftGridModal', props: { nftsData } }))

  return (
    <BottomModal modalId={id} contentVerticalGap title={t('Transaction')}>
      <Surface>
        <Row title={t('Amount')} transparent>
          {tokensWithSymbol.map(({ id, amount, decimals, symbol }) => (
            <AmountStyled
              key={id}
              value={amount}
              decimals={decimals}
              suffix={symbol}
              isUnknownToken={!symbol}
              highlight={!isMoved}
              showPlusMinus={!isMoved}
              fullPrecision
              bold
            />
          ))}
        </Row>
        <Row title={t('Timestamp')} transparent>
          <AppTextStyled semiBold>
            {dayjs(tx.timestamp).toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </AppTextStyled>
        </Row>
        <Row title={t('Status')} transparent>
          <AppText semiBold>
            {!tx.scriptExecutionOk ? t('Script execution failed') : tx.blockHash ? t('Confirmed') : t('Pending')}
          </AppText>
        </Row>
        <Row title={t('From')} transparent>
          {isOut ? <AddressBadge addressHash={tx.address.hash} /> : <IOList isOut={isOut} tx={tx} />}
        </Row>
        <Row title={t('To')} transparent>
          {!isOut ? <AddressBadge addressHash={tx.address.hash} /> : <IOList isOut={isOut} tx={tx} />}
        </Row>
        <Row title={t('Fee')} transparent isLast={unknownTokens.length === 0 && nftsData.length === 0}>
          <Amount
            value={BigInt(tx.gasPrice) * BigInt(tx.gasAmount)}
            fadeDecimals
            fullPrecision
            bold
            showOnDiscreetMode
          />
        </Row>
        {unknownTokens.length > 0 && (
          <Row title={t('Unknown tokens')} transparent isLast={nftsData.length === 0}>
            {unknownTokens.map(({ id, amount, decimals, symbol }) => (
              <UnknownTokenAmount key={id}>
                <AmountStyled
                  value={amount}
                  decimals={decimals}
                  suffix={symbol}
                  isUnknownToken={!symbol}
                  highlight={!isMoved}
                  showPlusMinus={!isMoved}
                  fullPrecision
                  bold
                />
                {!symbol && (
                  <TokenId>
                    <AppText numberOfLines={1} ellipsizeMode="middle">
                      {id}
                    </AppText>
                  </TokenId>
                )}
              </UnknownTokenAmount>
            ))}
          </Row>
        )}
        {nftsData.length === 1 && (
          <Row title={t('NFT')} noMaxWidth transparent isLast>
            <NFTThumbnail nftId={nftsData[0].id} size={100} />
          </Row>
        )}
        {nftsData.length > 1 && (
          <Row title={t('NFTs')} noMaxWidth transparent isLast>
            <Button title={t('See NFTs')} onPress={openNftGridModal} />
          </Row>
        )}
      </Surface>
      <Button
        iconProps={{ name: 'arrow-up-right' }}
        onPress={() => openBrowserAsync(explorerTxUrl)}
        title={t('Explorer')}
      />
    </BottomModal>
  )
})

export default TransactionModal

const AmountStyled = styled(Amount)`
  text-align: right;
`

const AppTextStyled = styled(AppText)`
  text-align: right;
`

const TokenId = styled.View`
  max-width: 60px;
`

const UnknownTokenAmount = styled.View`
  display: flex;
  flex-direction: row;
  column-gap: 10px;
  justify-content: flex-end;
  align-items: center;
`