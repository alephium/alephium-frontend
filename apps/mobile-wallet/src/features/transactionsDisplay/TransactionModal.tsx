import { AddressHash, findTransactionReferenceAddress, isConfirmedTx } from '@alephium/shared'
import {
  useFetchTransaction,
  useFetchTransactionTokens,
  useTransactionDirection,
  useTransactionInfoType,
  useUnsortedAddressesHashes
} from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import dayjs from 'dayjs'
import { openBrowserAsync } from 'expo-web-browser'
import { groupBy } from 'lodash'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Badge from '~/components/Badge'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import IOList from '~/components/IOList'
import NFTThumbnail from '~/components/NFTThumbnail'
import Row from '~/components/Row'
import BottomModal2 from '~/features/modals/BottomModal2'
import { openModal } from '~/features/modals/modalActions'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

interface TransactionModalProps {
  txHash: string
}

const TransactionModal = memo<TransactionModalProps & ModalBaseProp>(({ id, txHash }) => {
  const explorerBaseUrl = useAppSelector((s) => s.network.settings.explorerUrl)
  const { t } = useTranslation()
  const { onDismiss } = useModalDismiss({ id })

  const explorerTxUrl = `${explorerBaseUrl}/transactions/${txHash}`

  return (
    <BottomModal2 onDismiss={onDismiss} modalId={id} title={t('Transaction')}>
      <TransactionModalContent txHash={txHash} />

      <BottomButtons backgroundColor="back1" fullWidth>
        <Button
          iconProps={{ name: 'arrow-up-right' }}
          onPress={() => openBrowserAsync(explorerTxUrl)}
          title={t('Explorer')}
        />
      </BottomButtons>
    </BottomModal2>
  )
})

export default TransactionModal

const TransactionModalContent = ({ txHash }: TransactionModalProps) => {
  const { t } = useTranslation()
  const allAddressHashes = useUnsortedAddressesHashes()

  const { data: tx, isLoading } = useFetchTransaction({ txHash })

  if (isLoading)
    return (
      <EmptyPlaceholder>
        <AppText size={32}>⏳</AppText>
        <AppText>{t('Loading transaction details...')}</AppText>
      </EmptyPlaceholder>
    )

  if (!tx) return null

  const referenceAddress = findTransactionReferenceAddress(allAddressHashes, tx)

  if (!referenceAddress) return null

  return <TransactionDetailRows tx={tx} refAddressHash={referenceAddress} />
}

interface TransactionModalSubcomponentProps {
  tx: e.AcceptedTransaction | e.PendingTransaction
  refAddressHash: AddressHash
}

const TransactionDetailRows = ({ tx, refAddressHash }: TransactionModalSubcomponentProps) => {
  const { t } = useTranslation()
  const direction = useTransactionDirection(tx, refAddressHash)

  const isOut = direction === 'out'

  return (
    <>
      <Row title={t('From')} transparent>
        {isOut ? (
          <AddressBadge addressHash={refAddressHash} />
        ) : (
          <IOList
            currentAddress={refAddressHash}
            isOut={isOut}
            outputs={tx.outputs}
            inputs={tx.inputs}
            timestamp={isConfirmedTx(tx) ? tx.timestamp : undefined}
          />
        )}
      </Row>
      <Row title={t('To')} transparent>
        {!isOut ? (
          <AddressBadge addressHash={refAddressHash} />
        ) : (
          <IOList
            currentAddress={refAddressHash}
            isOut={isOut}
            outputs={tx.outputs}
            inputs={tx.inputs}
            timestamp={isConfirmedTx(tx) ? tx.timestamp : undefined}
          />
        )}
      </Row>

      {isConfirmedTx(tx) && (
        <Row title={t('Timestamp')} transparent>
          <AppText semiBold>
            {dayjs(tx.timestamp).toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </AppText>
        </Row>
      )}

      <TransactionStatus tx={tx} />

      <Row title={t('Fee')} transparent>
        <Amount value={BigInt(tx.gasPrice) * BigInt(tx.gasAmount)} fullPrecision bold showOnDiscreetMode />
      </Row>

      <TransactionAmounts tx={tx} refAddressHash={refAddressHash} />
    </>
  )
}

const TransactionStatus = ({ tx }: Pick<TransactionModalSubcomponentProps, 'tx'>) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const statuses = {
    confirmed: {
      color: theme.global.valid,
      text: t('Confirmed')
    },
    pending: {
      color: theme.bg.contrast,
      text: t('Pending')
    },
    scriptError: {
      color: theme.global.alert,
      text: t('Script execution failed')
    }
  }

  const status = !isConfirmedTx(tx)
    ? statuses.pending
    : !tx.scriptExecutionOk
      ? statuses.scriptError
      : statuses.confirmed

  return (
    <Row title={t('Status')} transparent>
      <Badge color={status.color}>{status.text}</Badge>
    </Row>
  )
}

const TransactionAmounts = ({ tx, refAddressHash }: TransactionModalSubcomponentProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const {
    data: { fungibleTokens, nfts, nsts }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash)

  const isMoved = infoType === 'move'
  const isPending = infoType === 'pending'
  const groupedFtAmounts = useMemo(
    () => groupBy(fungibleTokens, (t) => (t.amount > 0 ? 'in' : 'out')),
    [fungibleTokens]
  )

  const openNftGridModal = () => dispatch(openModal({ name: 'NftGridModal', props: { nftsData: nfts } }))

  return (
    <>
      {isMoved && (
        <Row title={t('Moved')} transparent>
          <AmountsContainer>
            {fungibleTokens.map(({ id, amount }) => (
              <AssetAmountWithLogo key={id} assetId={id} amount={amount} />
            ))}
          </AmountsContainer>
        </Row>
      )}
      {!isMoved && groupedFtAmounts.out && (
        <Row title={t(isPending ? 'Sending' : 'Sent')} transparent titleColor={theme.global.send}>
          <AmountsContainer>
            {groupedFtAmounts.out.map(({ id, amount }) => (
              <AssetAmountWithLogo key={id} assetId={id} amount={amount} logoPosition="right" />
            ))}
          </AmountsContainer>
        </Row>
      )}
      {!isMoved && groupedFtAmounts.in && (
        <Row title={t('Received')} transparent titleColor={theme.global.receive}>
          <AmountsContainer>
            {groupedFtAmounts.in.map(({ id, amount }) => (
              <AssetAmountWithLogo key={id} assetId={id} amount={amount} logoPosition="right" />
            ))}
          </AmountsContainer>
        </Row>
      )}

      {nfts.length === 1 && (
        <Row title={t('NFT')} noMaxWidth transparent>
          <NFTThumbnail nftId={nfts[0].id} size={100} />
        </Row>
      )}
      {nfts.length > 1 && (
        <Row title={t('NFTs')} noMaxWidth transparent>
          <Button title={t('See NFTs')} onPress={openNftGridModal} short />
        </Row>
      )}
      {nsts.length > 0 && (
        <Row title={t('Unknown tokens')} transparent>
          {nsts.map(({ id, amount }) => (
            <UnknownTokenAmount key={id}>
              <Amount
                value={amount}
                isUnknownToken
                highlight={!isMoved}
                showPlusMinus={!isMoved}
                fullPrecision
                semiBold
              />

              <TokenId>
                <AppText truncate ellipsizeMode="middle">
                  {id}
                </AppText>
              </TokenId>
            </UnknownTokenAmount>
          ))}
        </Row>
      )}
    </>
  )
}

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
