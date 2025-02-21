import {
  AssetAmount,
  getHumanReadableError,
  SessionRequestEvent,
  throttledClient,
  WALLETCONNECT_ERRORS
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { RelayMethod } from '@alephium/walletconnect-provider'
import {
  ApiRequestArguments,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignMessageParams,
  SignTransferTxParams,
  SignUnsignedTxParams
} from '@alephium/web3'
import { calcExpiry, getSdkError } from '@walletconnect/utils'
import { partition } from 'lodash'
import { memo, useCallback, useEffect } from 'react'

import useFetchWalletBalancesByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesByAddress'
import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { CallContractTxData, DeployContractTxData, TransferTxData } from '@/features/send/sendTypes'
import { shouldBuildSweepTransactions } from '@/features/send/sendUtils'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { SignMessageData, SignUnsignedTxData } from '@/features/walletConnect/walletConnectTypes'
import { cleanHistory, cleanMessages } from '@/features/walletConnect/walletConnectUtils'
import { useAppDispatch } from '@/hooks/redux'
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'
import { toggleAppLoading } from '@/storage/global/globalActions'

// The purpose of this component is to conditionally use the useFetch hooks only when a wallet is unlocked. That's why
// it is rendered in walletConnectContext.tsx only when there is an active wallet ID. This is to avoid adding cached
// query data from one wallet into another.

interface WalletConnectSessionRequestEventHandlerProps {
  sessionRequestEvent: SessionRequestEvent
}

const processedSessionRequestIds = new Set<number>()

const WalletConnectSessionRequestEventHandler = memo(
  ({ sessionRequestEvent }: WalletConnectSessionRequestEventHandlerProps) => {
    const { data: addressesBalances, isLoading: isLoadingAddressesBalances } = useFetchWalletBalancesByAddress()
    const { walletConnectClient, respondToWalletConnectWithError, respondToWalletConnect } = useWalletConnectContext()
    const addresses = useUnsortedAddresses()
    const dispatch = useAppDispatch()
    const { sendAnalytics } = useAnalytics()

    const cleanStorage = useCallback(
      async (event: SessionRequestEvent) => {
        if (!walletConnectClient) return
        if (event.params.request.method.startsWith('alph_request')) {
          cleanHistory(walletConnectClient, true)
        }
        await cleanMessages(walletConnectClient, event.topic)
      },
      [walletConnectClient]
    )

    const onSessionRequest = useCallback(
      async (event: SessionRequestEvent) => {
        if (!walletConnectClient) return

        console.log('event', event)

        const getSignerAddressByHash = (hash: string) => {
          const address = addresses.find((a) => a.hash === hash)
          if (!address) throw new Error(`Unknown signer address: ${hash}`)

          return address
        }

        const {
          params: { request }
        } = event

        try {
          switch (request.method as RelayMethod) {
            case 'alph_signAndSubmitTransferTx': {
              const p = request.params as SignTransferTxParams
              const dest = p.destinations[0]
              const assetAmounts = [
                { id: ALPH.id, amount: BigInt(dest.attoAlphAmount) },
                ...(dest.tokens ? dest.tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
              ]
              const addressBalances = addressesBalances[p.signerAddress] ?? []
              const shouldSweep = shouldBuildSweepTransactions(assetAmounts, addressBalances)

              const txData: TransferTxData = {
                fromAddress: getSignerAddressByHash(p.signerAddress),
                toAddress: p.destinations[0].address,
                assetAmounts,
                gasAmount: p.gasAmount,
                gasPrice: p.gasPrice?.toString(),
                shouldSweep
              }

              dispatch(
                openModal({
                  name: 'TransferSendModal',
                  props: {
                    initialStep: 'info-check',
                    initialTxData: txData,
                    txData,
                    triggeredByWalletConnect: true,
                    dAppUrl: event.verifyContext.verified.origin
                  }
                })
              )
              break
            }
            case 'alph_signAndSubmitDeployContractTx': {
              const { initialAttoAlphAmount, bytecode, issueTokenAmount, gasAmount, gasPrice, signerAddress } =
                request.params as SignDeployContractTxParams
              const initialAlphAmount: AssetAmount | undefined = initialAttoAlphAmount
                ? { id: ALPH.id, amount: BigInt(initialAttoAlphAmount) }
                : undefined

              const txData: DeployContractTxData = {
                fromAddress: getSignerAddressByHash(signerAddress),
                bytecode,
                initialAlphAmount,
                issueTokenAmount: issueTokenAmount?.toString(),
                gasAmount,
                gasPrice: gasPrice?.toString()
              }

              console.log('txData', txData)

              dispatch(
                openModal({
                  name: 'DeployContractSendModal',
                  props: {
                    initialStep: 'info-check',
                    initialTxData: txData,
                    txData: txData as DeployContractTxData,
                    triggeredByWalletConnect: true,
                    dAppUrl: event.verifyContext.verified.origin
                  }
                })
              )
              break
            }
            case 'alph_signAndSubmitExecuteScriptTx': {
              const { tokens, bytecode, gasAmount, gasPrice, signerAddress, attoAlphAmount } =
                request.params as SignExecuteScriptTxParams
              let assetAmounts: AssetAmount[] = []
              let allAlphAssets: AssetAmount[] = attoAlphAmount ? [{ id: ALPH.id, amount: BigInt(attoAlphAmount) }] : []

              if (tokens) {
                const assets = tokens.map((token) => ({ id: token.id, amount: BigInt(token.amount) }))
                const [alphAssets, tokenAssets] = partition(assets, (asset) => asset.id === ALPH.id)

                assetAmounts = tokenAssets
                allAlphAssets = [...allAlphAssets, ...alphAssets]
              }

              if (allAlphAssets.length > 0) {
                assetAmounts.push({
                  id: ALPH.id,
                  amount: allAlphAssets.reduce((total, asset) => total + (asset.amount ?? BigInt(0)), BigInt(0))
                })
              }

              const txData: CallContractTxData = {
                fromAddress: getSignerAddressByHash(signerAddress),
                bytecode,
                assetAmounts,
                gasAmount,
                gasPrice: gasPrice?.toString()
              }

              dispatch(
                openModal({
                  name: 'CallContractSendModal',
                  props: {
                    initialStep: 'info-check',
                    initialTxData: txData,
                    txData,
                    triggeredByWalletConnect: true,
                    dAppUrl: event.verifyContext.verified.origin
                  }
                })
              )
              break
            }
            case 'alph_signMessage': {
              const { message, messageHasher, signerAddress } = request.params as SignMessageParams
              const txData: SignMessageData = {
                fromAddress: getSignerAddressByHash(signerAddress),
                message,
                messageHasher
              }
              dispatch(
                openModal({ name: 'SignMessageModal', props: { txData, dAppUrl: event.verifyContext.verified.origin } })
              )
              break
            }
            case 'alph_signUnsignedTx':
            case 'alph_signAndSubmitUnsignedTx': {
              const { unsignedTx, signerAddress } = request.params as SignUnsignedTxParams
              const txData: SignUnsignedTxData = {
                fromAddress: getSignerAddressByHash(signerAddress),
                unsignedTx
              }
              dispatch(
                openModal({
                  name: 'SignUnsignedTxModal',
                  props: {
                    txData,
                    submit: request.method === 'alph_signAndSubmitUnsignedTx',
                    dAppUrl: event.verifyContext.verified.origin
                  }
                })
              )
              break
            }
            case 'alph_requestNodeApi': {
              walletConnectClient.core.expirer.set(event.id, calcExpiry(5))
              const p = request.params as ApiRequestArguments
              const result = await throttledClient.node.request(p)

              await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })
              await cleanStorage(event)
              break
            }
            case 'alph_requestExplorerApi': {
              walletConnectClient.core.expirer.set(event.id, calcExpiry(5))
              const p = request.params as ApiRequestArguments

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const call = (throttledClient.explorer as any)[`${p.path}`][`${p.method}`] as (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...arg0: any[]
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ) => Promise<any>
              const result = await call(...p.params)

              await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })
              await cleanStorage(event)
              break
            }
            default:
              respondToWalletConnectWithError(event, getSdkError('WC_METHOD_UNSUPPORTED'))
              throw new Error(`Method not supported: ${request.method}`)
          }
        } catch (error) {
          const message = 'Could not parse WalletConnect session request'

          sendAnalytics({ type: 'error', error, message })
          respondToWalletConnectWithError(event, {
            message: getHumanReadableError(error, message),
            code: WALLETCONNECT_ERRORS.PARSING_SESSION_REQUEST_FAILED
          })
        }
      },
      [
        addresses,
        addressesBalances,
        cleanStorage,
        dispatch,
        respondToWalletConnect,
        respondToWalletConnectWithError,
        sendAnalytics,
        walletConnectClient
      ]
    )

    useEffect(() => {
      if (isLoadingAddressesBalances) {
        dispatch(toggleAppLoading(true))
      } else {
        if (!processedSessionRequestIds.has(sessionRequestEvent.id)) {
          onSessionRequest(sessionRequestEvent)
          processedSessionRequestIds.add(sessionRequestEvent.id)
        }
        processedSessionRequestIds.add(sessionRequestEvent.id)
        dispatch(toggleAppLoading(false))
      }
    }, [dispatch, isLoadingAddressesBalances, onSessionRequest, sessionRequestEvent])

    return null
  }
)

export default WalletConnectSessionRequestEventHandler
