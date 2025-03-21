import { AddressHash, AssetAmount } from '@alephium/shared'
import { node, Token } from '@alephium/web3'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { buildSweepTransactions, buildUnsignedTransactions, signAndSendTransaction } from '~/api/transactions'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { selectAddressByHash } from '~/store/addresses/addressesSelectors'
import { transactionSent } from '~/store/transactions/transactionsActions'
import { showExceptionToast } from '~/utils/layout'
import { getTransactionAssetAmounts } from '~/utils/transactions'

type UnsignedTxData = {
  unsignedTxs: {
    txId: node.BuildTransferTxResult['txId'] | node.SweepAddressTransaction['txId']
    unsignedTx: node.BuildTransferTxResult['unsignedTx'] | node.SweepAddressTransaction['unsignedTx']
  }[]
  fees: bigint
}

type BuildTransactionCallbacks = {
  onBuildSuccess: () => void
  onConsolidationSuccess: () => void
}

interface SendContextValue {
  toAddress?: AddressHash
  setToAddress: (toAddress: AddressHash) => void
  fromAddress?: AddressHash
  setFromAddress: (toAddress: AddressHash) => void
  assetAmounts: AssetAmount[]
  setAssetAmount: (assetId: string, amount?: bigint) => void
  fees: bigint
  buildTransaction: (callbacks: BuildTransactionCallbacks) => Promise<void>
  sendTransaction: (onSendSuccess: () => void) => Promise<void>
}

const initialValues: SendContextValue = {
  toAddress: undefined,
  setToAddress: () => null,
  fromAddress: undefined,
  setFromAddress: () => null,
  assetAmounts: [],
  setAssetAmount: () => null,
  fees: BigInt(0),
  buildTransaction: () => Promise.resolve(undefined),
  sendTransaction: () => Promise.resolve(undefined)
}

const SendContext = createContext(initialValues)

interface SendContextProviderProps {
  children: ReactNode
  originAddressHash?: AddressHash
  destinationAddressHash?: AddressHash
  tokenId?: Token['id']
  isNft?: boolean
}

export const SendContextProvider = ({
  children,
  originAddressHash,
  destinationAddressHash,
  tokenId,
  isNft
}: SendContextProviderProps) => {
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const [toAddress, setToAddress] = useState<SendContextValue['toAddress']>(destinationAddressHash)
  const [fromAddress, setFromAddress] = useState<SendContextValue['fromAddress']>(originAddressHash)
  const [assetAmounts, setAssetAmounts] = useState<SendContextValue['assetAmounts']>(
    tokenId && isNft ? [{ id: tokenId, amount: BigInt(1) }] : []
  )
  const [unsignedTxData, setUnsignedTxData] = useState<UnsignedTxData>({ unsignedTxs: [], fees: initialValues.fees })

  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [onSendSuccessCallback, setOnSendSuccessCallback] = useState<() => void>(() => () => null)

  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))

  const setAssetAmount = useCallback(
    (assetId: string, amount?: bigint) => {
      const existingAmountIndex = assetAmounts.findIndex(({ id }) => id === assetId)
      const newAssetAmounts = [...assetAmounts]

      if (existingAmountIndex !== -1) {
        amount
          ? newAssetAmounts.splice(existingAmountIndex, 1, { id: assetId, amount })
          : newAssetAmounts.splice(existingAmountIndex, 1)
      } else if (amount) {
        newAssetAmounts.push({ id: assetId, amount })
      }

      setAssetAmounts(newAssetAmounts)
    },
    [assetAmounts]
  )

  const buildConsolidationTransactions = useCallback(async () => {
    if (!address) return

    try {
      const data = await buildSweepTransactions(address.hash, address.hash)
      setUnsignedTxData(data)
    } catch (e) {
      showExceptionToast(e, t('Could not build transaction'))
    }
  }, [address, t])

  const sendTransaction = useCallback(
    async (onSendSuccess: () => void) => {
      if (!address || !toAddress) return

      const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)

      try {
        for (const { txId, unsignedTx } of unsignedTxData.unsignedTxs) {
          const data = await signAndSendTransaction(address.hash, txId, unsignedTx)

          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: address.hash,
              toAddress: consolidationRequired ? address.hash : toAddress,
              amount: attoAlphAmount,
              tokens,
              timestamp: new Date().getTime(),
              status: 'pending',
              type: 'transfer'
            })
          )
        }

        onSendSuccess()

        sendAnalytics({ event: 'Send: Sent transaction', props: { tokens: tokens.length } })
      } catch (error) {
        const message = t('Could not send transaction')

        showExceptionToast(error, message)
        sendAnalytics({ type: 'error', message })
      }
    },
    [address, assetAmounts, consolidationRequired, dispatch, t, toAddress, unsignedTxData.unsignedTxs]
  )

  const authenticateAndSend = useCallback(
    async (onSendSuccess: () => void) => {
      await triggerBiometricsAuthGuard({
        settingsToCheck: 'transactions',
        successCallback: () =>
          triggerFundPasswordAuthGuard({
            successCallback: () => sendTransaction(onSendSuccess)
          })
      })
    },
    [sendTransaction, triggerBiometricsAuthGuard, triggerFundPasswordAuthGuard]
  )

  const buildTransaction = useCallback(
    async (callbacks: BuildTransactionCallbacks) => {
      if (!address || !toAddress) return

      try {
        const data = await buildUnsignedTransactions(address, toAddress, assetAmounts)
        if (data) setUnsignedTxData(data)
        callbacks.onBuildSuccess()
      } catch (e) {
        const error = (e as unknown as string).toString()

        if (error.includes('consolidating') || error.includes('consolidate')) {
          setConsolidationRequired(true)
          dispatch(
            openModal({
              name: 'ConsolidationModal',
              props: {
                onConsolidate: () => {
                  authenticateAndSend(onSendSuccessCallback)
                },
                fees: unsignedTxData.fees
              }
            })
          )
          setOnSendSuccessCallback(() => callbacks.onConsolidationSuccess)
          await buildConsolidationTransactions()
        } else {
          showExceptionToast(e, t('Could not build transaction'))
        }
      }
    },
    [
      address,
      assetAmounts,
      authenticateAndSend,
      buildConsolidationTransactions,
      dispatch,
      onSendSuccessCallback,
      t,
      toAddress,
      unsignedTxData.fees
    ]
  )

  return (
    <SendContext.Provider
      value={{
        toAddress,
        setToAddress,
        fromAddress,
        setFromAddress,
        assetAmounts,
        setAssetAmount,
        fees: unsignedTxData.fees,
        buildTransaction,
        sendTransaction: authenticateAndSend
      }}
    >
      {children}
    </SendContext.Provider>
  )
}

export const useSendContext = () => useContext(SendContext)
