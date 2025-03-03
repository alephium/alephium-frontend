import { NFT } from '@alephium/shared'
import dayjs from 'dayjs'
import { openBrowserAsync } from 'expo-web-browser'
import { groupBy, partition } from 'lodash'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Badge from '~/components/Badge'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import IOList from '~/components/IOList'
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
  const theme = useTheme()

  const { direction, infoType, assets } = getTransactionInfo(tx)
  const [tokensWithSymbol, tokensWithoutSymbol] = partition(assets, (asset) => !!asset.symbol)
  const [nfts, unknownTokens] = partition(tokensWithoutSymbol, (token) => !!allNFTs[token.id])
  const nftsData = nfts.map((nft) => allNFTs[nft.id] as NFT)
  const explorerTxUrl = `${explorerBaseUrl}/transactions/${tx.hash}`
  const isOut = direction === 'out'
  const isMoved = infoType === 'move'

  const openNftGridModal = () => dispatch(openModal({ name: 'NftGridModal', props: { nftsData } }))

  const groupedIOAmounts = groupBy(tokensWithSymbol, (t) => (t.amount > 0 ? 'in' : 'out'))

  const statuses = {
    confirmed: {
      color: theme.global.valid,
      text: t('Confirmed')
    },
    pending: {
      color: theme.bg.primary,
      text: t('Pending')
    },
    scriptError: {
      color: theme.global.alert,
      text: t('Script execution failed')
    }
  }

  const status = !tx.scriptExecutionOk ? statuses.scriptError : tx.blockHash ? statuses.confirmed : statuses.pending

  return (
    <BottomModal modalId={id} title={t('Transaction')}>
      <Row title={t('From')} transparent>
        {isOut ? <AddressBadge addressHash={tx.address.hash} /> : <IOList isOut={isOut} tx={tx} />}
      </Row>
      <Row title={t('To')} transparent>
        {!isOut ? <AddressBadge addressHash={tx.address.hash} /> : <IOList isOut={isOut} tx={tx} />}
      </Row>
      <Row title={t('Timestamp')} transparent>
        <AppText semiBold>
          {dayjs(tx.timestamp).toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
        </AppText>
      </Row>
      <Row title={t('Status')} transparent>
        <Badge color={status.color}>{status.text}</Badge>
      </Row>
      <Row title={t('Fee')} transparent>
        <Amount value={BigInt(tx.gasPrice) * BigInt(tx.gasAmount)} fullPrecision bold showOnDiscreetMode />
      </Row>
      {isMoved && (
        <Row title={t('Moved')} transparent>
          <AmountsContainer>
            {tokensWithSymbol.map(({ id, amount }) => (
              <AssetAmountWithLogo key={id} assetId={id} amount={amount} />
            ))}
          </AmountsContainer>
        </Row>
      )}
      {!isMoved && groupedIOAmounts.out && (
        <Row title={t('Sent')} transparent titleColor={theme.global.send}>
          <AmountsContainer>
            {groupedIOAmounts.out.map(({ id, amount }) => (
              <AssetAmountWithLogo key={id} assetId={id} amount={amount} logoPosition="right" />
            ))}
          </AmountsContainer>
        </Row>
      )}
      {!isMoved && groupedIOAmounts.in && (
        <Row title={t('Received')} transparent titleColor={theme.global.receive}>
          <AmountsContainer>
            {groupedIOAmounts.in.map(({ id, amount }) => (
              <AssetAmountWithLogo key={id} assetId={id} amount={amount} logoPosition="right" />
            ))}
          </AmountsContainer>
        </Row>
      )}

      {nftsData.length === 1 && (
        <Row title={t('NFT')} noMaxWidth transparent>
          <NFTThumbnail nftId={nftsData[0].id} size={100} />
        </Row>
      )}
      {nftsData.length > 1 && (
        <Row title={t('NFTs')} noMaxWidth transparent>
          <Button title={t('See NFTs')} onPress={openNftGridModal} short />
        </Row>
      )}
      {unknownTokens.length > 0 && (
        <Row title={t('Unknown tokens')} transparent>
          {unknownTokens.map(({ id, amount, decimals, symbol }) => (
            <UnknownTokenAmount key={id}>
              <Amount
                value={amount}
                decimals={decimals}
                suffix={symbol}
                isUnknownToken={!symbol}
                highlight={!isMoved}
                showPlusMinus={!isMoved}
                fullPrecision
                semiBold
              />
              {!symbol && (
                <TokenId>
                  <AppText truncate ellipsizeMode="middle">
                    {id}
                  </AppText>
                </TokenId>
              )}
            </UnknownTokenAmount>
          ))}
        </Row>
      )}

      <BottomButtons backgroundColor="back1" fullWidth>
        <Button
          iconProps={{ name: 'arrow-up-right' }}
          onPress={() => openBrowserAsync(explorerTxUrl)}
          title={t('Explorer')}
        />
      </BottomButtons>
    </BottomModal>
  )
})

export default TransactionModal

const TokenId = styled.View`
  max-width: 120px;
`

const UnknownTokenAmount = styled.View`
  display: flex;
  flex-direction: row;
  column-gap: 10px;
  align-items: center;
`

const AmountsContainer = styled.View`
  gap: 5px;
  align-items: flex-end;
`
