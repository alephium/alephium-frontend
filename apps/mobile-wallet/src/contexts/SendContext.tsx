import {
  AddressHash,
  AssetAmount,
  getChainedTxPropsFromSignChainedTxParams,
  getGasRefillChainedTxParams,
  getSweepTxParams,
  getTransferTxParams,
  isConsolidationError,
  isInsufficientFundsError,
  selectAddressByHash,
  SignChainedTxModalProps,
  throttledClient
} from '@alephium/shared'
import { useFetchGroupedAddressesWithEnoughAlphForGas } from '@alephium/shared-react'
import { Token } from '@alephium/web3'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import {
  fetchSweepTransactionsFees,
  fetchTransferTransactionsFees,
  sendChainedTransactions,
  sendSweepTransactions,
  sendTransferTransactions
} from '~/api/transactions'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { signer } from '~/signer'
import { showExceptionToast } from '~/utils/layout'

export type BuildTransactionCallbacks = {
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
  buildTransaction: (callbacks: BuildTransactionCallbacks, shouldSweep: boolean) => Promise<void>
  sendTransaction: (onSendSuccess: () => void) => Promise<void>
  chainedTxProps?: SignChainedTxModalProps['props']
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
  sendTransaction: () => Promise.resolve(undefined),
  chainedTxProps: []
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
  const [fees, setFees] = useState<bigint>(initialValues.fees)
  const [chainedTxProps, setChainedTxProps] = useState<SignChainedTxModalProps['props']>()
  const [shouldSweep, setShouldSweep] = useState(false)

  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))
  const { data: groupedAddressesWithEnoughAlphForGas } = useFetchGroupedAddressesWithEnoughAlphForGas()
  const gasRefillGroupedAddress = groupedAddressesWithEnoughAlphForGas?.find((hash) => hash !== address?.hash)
  const shouldChainTxsForGasRefill = chainedTxProps && chainedTxProps.length > 0 && gasRefillGroupedAddress

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

  const sendTransaction = useCallback(
    async (onSendSuccess: () => void) => {
      if (!address || !toAddress) return

      try {
        const sendFlowData = { fromAddress: address, toAddress, assetAmounts }

        if (shouldSweep) {
          const txParams = getSweepTxParams(sendFlowData)
          await sendSweepTransactions(txParams)
        } else if (shouldChainTxsForGasRefill) {
          const txParams = getGasRefillChainedTxParams(gasRefillGroupedAddress, sendFlowData)
          await sendChainedTransactions(txParams)
        } else {
          const txParams = getTransferTxParams(sendFlowData)
          await sendTransferTransactions(txParams)
        }

        onSendSuccess()
        sendAnalytics({ event: 'Send: Sent transaction' })
      } catch (error) {
        const message = t('Could not send transaction')

        showExceptionToast(error, message)
        sendAnalytics({ type: 'error', message })
      }
    },
    [address, assetAmounts, gasRefillGroupedAddress, shouldChainTxsForGasRefill, shouldSweep, t, toAddress]
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
    async (callbacks: BuildTransactionCallbacks, shouldSweep: boolean) => {
      if (!address || !toAddress) return

      setShouldSweep(shouldSweep)
      setChainedTxProps(undefined)

      const sendFlowData = { fromAddress: address, toAddress, assetAmounts }

      try {
        if (shouldSweep) {
          const txParams = getSweepTxParams(sendFlowData)
          const fees = await fetchSweepTransactionsFees(txParams)
          setFees(fees)
        } else {
          const txParams = getTransferTxParams(sendFlowData)
          const fees = await fetchTransferTransactionsFees(txParams)
          setFees(fees)
        }

        callbacks.onBuildSuccess()
      } catch (e) {
        try {
          if (isConsolidationError(e)) {
            const txParams = getSweepTxParams({ ...sendFlowData, toAddress: address.hash })
            const fees = await fetchSweepTransactionsFees(txParams)

            dispatch(
              openModal({
                name: 'SignConsolidateTxModal',
                props: { txParams, onSuccess: callbacks.onConsolidationSuccess, fees }
              })
            )

            setChainedTxProps(undefined)
          } else if (isInsufficientFundsError(e) && gasRefillGroupedAddress) {
            const txParams = getGasRefillChainedTxParams(gasRefillGroupedAddress, sendFlowData)

            const unsignedData = await throttledClient.txBuilder.buildChainedTx(txParams, [
              await signer.getPublicKey(gasRefillGroupedAddress),
              await signer.getPublicKey(address.hash)
            ])

            const props = getChainedTxPropsFromSignChainedTxParams(txParams, unsignedData)
            setChainedTxProps(props)
            setShouldSweep(false)

            callbacks.onBuildSuccess()
          } else throw e
        } catch (e) {
          showExceptionToast(e, t('Could not build transaction'))
          setChainedTxProps(undefined)
        }
      }
    },
    [address, toAddress, assetAmounts, dispatch, t, gasRefillGroupedAddress]
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
        chainedTxProps,
        fees,
        buildTransaction,
        sendTransaction: authenticateAndSend
      }}
    >
      {children}
    </SendContext.Provider>
  )
}

export const useSendContext = () => useContext(SendContext)
