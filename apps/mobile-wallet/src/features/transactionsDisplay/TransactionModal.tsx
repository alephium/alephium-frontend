import { AddressHash, ExecuteScriptTx, findTransactionReferenceAddress, isConfirmedTx } from '@alephium/shared'
import {
  useFetchTransaction,
  useFetchTransactionTokens,
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

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Badge from '~/components/Badge'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import NFTThumbnail from '~/components/NFTThumbnail'
import Row from '~/components/Row'
import BottomModal2 from '~/features/modals/BottomModal2'
import { openModal } from '~/features/modals/modalActions'
import {
  TransactionDestinationAddressesList,
  TransactionOriginAddressesList
} from '~/features/transactionsDisplay/InputsOutputsLists'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

interface TransactionModalProps {
  txHash: string
}

const TransactionModal = memo<TransactionModalProps>(({ txHash }) => {
  const explorerBaseUrl = useAppSelector((s) => s.network.settings.explorerUrl)
  const { t } = useTranslation()

  const explorerTxUrl = `${explorerBaseUrl}/transactions/${txHash}`

  return (
    <BottomModal2 title={t('Transaction')}>
      <TransactionModalContent txHash={txHash} />

      <BottomButtons backgroundColor="back1" fullWidth>
        <Button
          iconProps={{ name: 'open-outline' }}
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

  return <TransactionDetailRows tx={tx} referenceAddress={referenceAddress} />
}

interface TransactionModalSubcomponentProps {
  tx: e.AcceptedTransaction | e.PendingTransaction | ExecuteScriptTx
  referenceAddress: AddressHash
}

const TransactionDetailRows = ({ tx, referenceAddress }: TransactionModalSubcomponentProps) => (
  <>
    <TransactionAddresses tx={tx} referenceAddress={referenceAddress} />

    <TransactionTimeStamp tx={tx} />

    <TransactionStatus tx={tx} />

    <TransactionFee tx={tx} />

    <TransactionAmounts tx={tx} referenceAddress={referenceAddress} />
  </>
)

const TransactionTimeStamp = ({ tx }: Pick<TransactionModalSubcomponentProps, 'tx'>) => {
  const { t } = useTranslation()

  if (!isConfirmedTx(tx)) return null

  return (
    <Row title={t('Timestamp')} transparent>
      <AppText semiBold>
        {dayjs(tx.timestamp).toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
      </AppText>
    </Row>
  )
}

const TransactionFee = ({ tx }: Pick<TransactionModalSubcomponentProps, 'tx'>) => {
  const { t } = useTranslation()

  return (
    <Row title={t('Fee')} transparent>
      <Amount value={BigInt(tx.gasPrice) * BigInt(tx.gasAmount)} fullPrecision bold showOnDiscreetMode />
    </Row>
  )
}

const TransactionAddresses = ({ tx, referenceAddress }: TransactionModalSubcomponentProps) => {
  const { t } = useTranslation()
  const infoType = useTransactionInfoType({ tx, referenceAddress, view: 'wallet' })

  if (infoType === 'dApp-failed') {
    return (
      <Row title={t('Addresses')} transparent>
        <TransactionOriginAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" />
      </Row>
    )
  }

  if (infoType === 'bidirectional-transfer' || infoType === 'dApp') {
    return (
      <Row title={t('Addresses')} transparent>
        <AddressesList>
          <TransactionOriginAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" />
          <AppText color="secondary">{t('and')}</AppText>
          <TransactionDestinationAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" />
        </AddressesList>
      </Row>
    )
  }

  return (
    <>
      <Row title={t('From')} transparent>
        <TransactionOriginAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" />
      </Row>
      <Row title={t('To')} transparent>
        <TransactionDestinationAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" />
      </Row>
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

interface TransactionAmountsProps extends TransactionModalSubcomponentProps {
  isLast?: boolean
}

export const TransactionAmounts = ({ tx, referenceAddress, isLast }: TransactionAmountsProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const {
    data: { fungibleTokens, nfts, nsts }
  } = useFetchTransactionTokens(tx, referenceAddress)
  const infoType = useTransactionInfoType({ tx, referenceAddress, view: 'wallet' })

  const groupedFtAmounts = useMemo(
    () => groupBy(fungibleTokens, (t) => (t.amount > 0 ? 'in' : 'out')),
    [fungibleTokens]
  )

  if (infoType === 'address-group-transfer' || infoType === 'address-self-transfer') {
    return null
  }

  const isMoved = infoType === 'wallet-self-transfer'
  const isPending = infoType === 'pending'

  const openNftGridModal = () => dispatch(openModal({ name: 'NftGridModal', props: { nftsData: nfts } }))

  return (
    <>
      {isMoved && (
        <Row title={t('Moved')} transparent isLast={isLast && nfts.length === 0}>
          <AmountsContainer>
            {fungibleTokens.map(({ id, amount }) => (
              <AssetAmountWithLogo key={id} assetId={id} amount={amount} />
            ))}
          </AmountsContainer>
        </Row>
      )}
      {!isMoved && groupedFtAmounts.out && (
        <Row
          title={t(isPending ? 'Sending' : 'Sent')}
          transparent
          titleColor={theme.global.send}
          isLast={isLast && nfts.length === 0}
        >
          <AmountsContainer>
            {groupedFtAmounts.out.map(({ id, amount }) => (
              <AssetAmountWithLogo key={id} assetId={id} amount={amount} logoPosition="right" />
            ))}
          </AmountsContainer>
        </Row>
      )}
      {!isMoved && groupedFtAmounts.in && (
        <Row title={t('Received')} transparent titleColor={theme.global.receive} isLast={isLast && nfts.length === 0}>
          <AmountsContainer>
            {groupedFtAmounts.in.map(({ id, amount }) => (
              <AssetAmountWithLogo key={id} assetId={id} amount={amount} logoPosition="right" />
            ))}
          </AmountsContainer>
        </Row>
      )}

      {nfts.length === 1 && (
        <Row title={t('NFT')} noMaxWidth transparent isLast={isLast}>
          <NFTThumbnail nftId={nfts[0].id} size={100} />
        </Row>
      )}
      {nfts.length > 1 && (
        <Row title={t('NFTs')} noMaxWidth transparent isLast={isLast}>
          <Button title={t('See NFTs')} onPress={openNftGridModal} short />
        </Row>
      )}
      {nsts.length > 0 && (
        <Row title={t('Unknown tokens')} transparent isLast={isLast}>
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

const AddressesList = styled.View`
  align-items: flex-end;
  gap: 5px;
`
