/*
Copyright 2018 - 2022 The Alephium Authors
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

import { APIError, AssetAmount, fromHumanReadableAmount, getHumanReadableError } from '@alephium/sdk'
import { node } from '@alephium/web3'
import { usePostHog } from 'posthog-react-native'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import Toast from 'react-native-root-toast'

import client from '~/api/client'
import { buildSweepTransactions, buildUnsignedTransactions, signAndSendTransaction } from '~/api/transactions'
import ConfirmWithAuthModal from '~/components/ConfirmWithAuthModal'
import ConsolidationModal from '~/components/ConsolidationModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAddressByHash, transactionSent } from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'
import { TxType } from '~/types/transactions'
import { getOptionalTransactionAssetAmounts, getTransactionAssetAmounts } from '~/utils/transactions'

type UnsignedTxData = {
  unsignedTxs: {
    txId: node.BuildTransactionResult['txId'] | node.SweepAddressTransaction['txId']
    unsignedTx: node.BuildTransactionResult['unsignedTx'] | node.SweepAddressTransaction['unsignedTx']
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
  bytecode?: string
  setBytecode: (bytecode: string) => void
  setAssetAmount: (assetId: string, amount?: bigint) => void
  setAssetAmounts: (assetAmounts: { id: string; amount?: bigint }[]) => void
  fees: bigint
  buildTransaction: (txType: TxType, callbacks: BuildTransactionCallbacks) => Promise<void>
  sendTransaction: (onSendSuccess: (signature?: string) => void) => Promise<void>
  resetSendState: () => void
  setGasAmount: (gasAmount?: number) => void
  setGasPrice: (gasPrice?: string) => void
  setBuildTxCallbacks: (callbacks: BuildTransactionCallbacks) => void
  setSendWorkflowType: (txType: TxType) => void
  initialAlphAmount?: AssetAmount
  setInitialAlphAmount: (alph?: AssetAmount) => void
  issueTokenAmount?: string
  setIssueTokenAmount: (tokenAmount?: string) => void
}

const initialValues: SendContextValue = {
  toAddress: undefined,
  setToAddress: () => null,
  fromAddress: undefined,
  setFromAddress: () => null,
  assetAmounts: [],
  bytecode: undefined,
  setBytecode: () => null,
  setAssetAmount: () => null,
  setAssetAmounts: () => null,
  fees: BigInt(0),
  buildTransaction: () => Promise.resolve(undefined),
  sendTransaction: () => Promise.resolve(undefined),
  resetSendState: () => null,
  setGasAmount: () => null,
  setGasPrice: () => null,
  setBuildTxCallbacks: () => null,
  setSendWorkflowType: () => null,
  initialAlphAmount: undefined,
  setInitialAlphAmount: () => null,
  issueTokenAmount: undefined,
  setIssueTokenAmount: () => null
}

const SendContext = createContext(initialValues)

export const SendContextProvider = ({ children }: { children: ReactNode }) => {
  const requiresAuth = useAppSelector((s) => s.settings.requireAuth)
  const dispatch = useAppDispatch()
  const posthog = usePostHog()

  const [toAddress, setToAddress] = useState<SendContextValue['toAddress']>(initialValues.toAddress)
  const [fromAddress, setFromAddress] = useState<SendContextValue['fromAddress']>(initialValues.fromAddress)
  const [assetAmounts, setAssetAmounts] = useState<SendContextValue['assetAmounts']>(initialValues.assetAmounts)
  const [bytecode, setBytecode] = useState<SendContextValue['bytecode']>(initialValues.bytecode)
  const [unsignedTxData, setUnsignedTxData] = useState<UnsignedTxData>({ unsignedTxs: [], fees: initialValues.fees })
  const [gasAmount, setGasAmount] = useState<number>()
  const [gasPrice, setGasPrice] = useState<string>()
  const [buildTxCallbacks, setBuildTxCallbacks] = useState<BuildTransactionCallbacks>()
  const [initialAlphAmount, setInitialAlphAmount] = useState<SendContextValue['initialAlphAmount']>(
    initialValues.initialAlphAmount
  )
  const [issueTokenAmount, setIssueTokenAmount] = useState<SendContextValue['issueTokenAmount']>(
    initialValues.issueTokenAmount
  )

  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isConsolidateModalVisible, setIsConsolidateModalVisible] = useState(false)
  const [isAuthenticationModalVisible, setIsAuthenticationModalVisible] = useState(false)
  const [onSendSuccessCallback, setOnSendSuccessCallback] = useState<() => void>(() => () => null)

  const [sendWorkflowType, setSendWorkflowType] = useState<TxType>()

  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))

  const resetSendState = useCallback(() => {
    setToAddress(initialValues.toAddress)
    setFromAddress(initialValues.fromAddress)
    setAssetAmounts(initialValues.assetAmounts)
    setGasAmount(undefined)
    setGasPrice(undefined)
    setUnsignedTxData({ unsignedTxs: [], fees: initialValues.fees })
    setBytecode(undefined)
    setBuildTxCallbacks(undefined)
    setSendWorkflowType(undefined)
    setInitialAlphAmount(undefined)
    setIssueTokenAmount(undefined)

    setConsolidationRequired(false)
    setIsConsolidateModalVisible(false)
    setIsAuthenticationModalVisible(false)
    setOnSendSuccessCallback(() => () => null)
  }, [])

  const setAssetAmount = (assetId: string, amount?: bigint) => {
    const existingAmountIndex = assetAmounts.findIndex(({ id }) => id === assetId)
    const newAssetAmounts = [...assetAmounts]

    if (existingAmountIndex !== -1) {
      amount
        ? newAssetAmounts.splice(existingAmountIndex, 1, { id: assetId, amount })
        : newAssetAmounts.splice(existingAmountIndex, 1)
    } else {
      newAssetAmounts.push({ id: assetId, amount })
    }

    setAssetAmounts(newAssetAmounts)
  }

  const buildConsolidationTransactions = useCallback(async () => {
    if (!address) return

    try {
      const data = await buildSweepTransactions(address, address.hash)
      setUnsignedTxData(data)
    } catch (e) {
      Toast.show(getHumanReadableError(e, 'Error while building the transaction'))

      posthog?.capture('Error', { message: 'Could not build consolidation transactions' })
    }
  }, [address, posthog])

  const buildTransaction = useCallback(
    async (txType: TxType, callbacks: BuildTransactionCallbacks) => {
      console.log('SEND CONTEXT BUILD TX IS CALLED WITH STATE:')
      console.log('fromAddress', fromAddress)
      console.log('assetAmounts', assetAmounts)
      console.log('gasAmount', gasAmount)
      console.log('gasPrice', gasPrice)
      console.log('bytecode', bytecode)

      if (!address) return

      try {
        let data

        switch (txType) {
          case TxType.TRANSFER:
            if (!toAddress) throw new Error('Destination address not set')

            data = await buildUnsignedTransactions(address, toAddress, assetAmounts, gasAmount, gasPrice)
            break
          case TxType.SCRIPT: {
            console.log('SEND CONTEXT CAPTURED SCRIPT EVENT, BUILDING TX...')

            if (!bytecode) throw new Error('Bytecode not set')

            const { attoAlphAmount, tokens } = getOptionalTransactionAssetAmounts(assetAmounts)
            const result = await client.node.contracts.postContractsUnsignedTxExecuteScript({
              fromPublicKey: address.publicKey,
              bytecode,
              attoAlphAmount,
              tokens,
              gasAmount: gasAmount,
              gasPrice: gasPrice ? fromHumanReadableAmount(gasPrice).toString() : undefined
            })

            console.log('SEND CONTEXT RESULT FROM BUILDING SCRIPT TX:', result)

            data = {
              unsignedTxs: [{ txId: result.txId, unsignedTx: result.unsignedTx }],
              fees: BigInt(result.gasAmount) * BigInt(result.gasPrice)
            }
            break
          }
          case TxType.DEPLOY_CONTRACT: {
            if (!bytecode) throw new Error('Bytecode not set')

            const result = await client.node.contracts.postContractsUnsignedTxDeployContract({
              fromPublicKey: address.publicKey,
              bytecode,
              initialAttoAlphAmount: initialAlphAmount !== undefined ? initialAlphAmount.amount?.toString() : undefined,
              issueTokenAmount: issueTokenAmount?.toString(),
              gasAmount: gasAmount,
              gasPrice: gasPrice?.toString()
            })

            data = {
              unsignedTxs: [{ txId: result.txId, unsignedTx: result.unsignedTx }],
              fees: BigInt(result.gasAmount) * BigInt(result.gasPrice)
            }
            break
          }
        }

        if (data) {
          setUnsignedTxData(data)
          callbacks.onBuildSuccess()
        }
      } catch (e) {
        // TODO: When API error codes are available, replace this substring check with a proper error code check
        const { error } = e as APIError
        if (error?.detail && (error.detail.includes('consolidating') || error.detail.includes('consolidate'))) {
          setConsolidationRequired(true)
          setIsConsolidateModalVisible(true)
          setOnSendSuccessCallback(() => callbacks.onConsolidationSuccess)
          await buildConsolidationTransactions()
        } else {
          Toast.show(getHumanReadableError(e, 'Error while building the transaction'))

          posthog?.capture('Error', { message: 'Could not build transaction' })
        }
      }
    },
    [
      address,
      assetAmounts,
      buildConsolidationTransactions,
      bytecode,
      fromAddress,
      gasAmount,
      gasPrice,
      initialAlphAmount,
      issueTokenAmount,
      posthog,
      toAddress
    ]
  )

  const sendTransaction = useCallback(
    async (onSendSuccess: (signature?: string) => void) => {
      console.log('SENDING TRANSACTION WITH STATE:')

      console.log('address', address)
      console.log('assetAmounts', assetAmounts)
      console.log('unsignedTxData', unsignedTxData)

      if (!address) return

      const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)
      let signature

      try {
        for (const { txId, unsignedTx } of unsignedTxData.unsignedTxs) {
          const data = await signAndSendTransaction(address, txId, unsignedTx)
          signature = data.signature

          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: address.hash,
              toAddress: consolidationRequired ? address.hash : toAddress ?? '',
              amount: attoAlphAmount,
              tokens,
              timestamp: new Date().getTime(),
              status: 'pending'
            })
          )
        }

        console.log('SUCCESS SENDING')

        onSendSuccess(signature)
        resetSendState()

        posthog?.capture('Send: Sent transaction', { tokens: tokens.length })
      } catch (e) {
        Toast.show(getHumanReadableError(e, 'Could not send transaction'))

        posthog?.capture('Error', { message: 'Could not send transaction' })
      }
    },
    [address, assetAmounts, consolidationRequired, dispatch, posthog, resetSendState, toAddress, unsignedTxData]
  )

  const authenticateAndSend = useCallback(
    async (onSendSuccess: () => void) => {
      if (requiresAuth) {
        setOnSendSuccessCallback(() => onSendSuccess)
        setIsAuthenticationModalVisible(true)
      } else {
        sendTransaction(onSendSuccess)
      }
    },
    [requiresAuth, sendTransaction]
  )

  useEffect(() => {
    if (sendWorkflowType && buildTxCallbacks) {
      console.log('USE EFFECT OF SEND CONTEXT GETS TRIGGERED TO OPEN MODAL')

      buildTransaction(sendWorkflowType, buildTxCallbacks)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildTxCallbacks, sendWorkflowType])

  return (
    <SendContext.Provider
      value={{
        toAddress,
        setToAddress,
        fromAddress,
        setFromAddress,
        assetAmounts,
        bytecode,
        setBytecode,
        setAssetAmount,
        setAssetAmounts,
        fees: unsignedTxData.fees,
        buildTransaction,
        sendTransaction: authenticateAndSend,
        resetSendState,
        setGasAmount,
        setGasPrice,
        setBuildTxCallbacks,
        setSendWorkflowType,
        initialAlphAmount,
        setInitialAlphAmount,
        issueTokenAmount,
        setIssueTokenAmount
      }}
    >
      {children}
      {isConsolidateModalVisible && (
        <ConsolidationModal
          onConsolidate={() => authenticateAndSend(onSendSuccessCallback)}
          onCancel={() => setIsConsolidateModalVisible(false)}
          fees={unsignedTxData.fees}
        />
      )}
      {isAuthenticationModalVisible && (
        <ConfirmWithAuthModal
          onConfirm={() => sendTransaction(onSendSuccessCallback)}
          onClose={() => setIsAuthenticationModalVisible(false)}
        />
      )}
    </SendContext.Provider>
  )
}

export const useSendContext = () => useContext(SendContext)
