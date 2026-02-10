import {
  getChainedTxPropsFromSignChainedTxParams,
  getHumanReadableError,
  isConsolidationError,
  isInsufficientFundsError,
  isNetworkValid,
  selectAllAddressByType,
  SessionRequestEvent,
  throttledClient,
  TransactionParams,
  WALLETCONNECT_ERRORS
} from '@alephium/shared'
import {
  getRefillMissingBalancesChainedTxParams,
  nodeTransactionDecodeUnsignedTxQuery,
  queryClient,
  useCurrentlyOnlineNetworkId,
  useFetchWalletBalancesByAddress,
  useUnsortedAddresses
} from '@alephium/shared-react'
import { parseChain, RelayMethod } from '@alephium/walletconnect-provider'
import {
  ApiRequestArguments,
  SignChainedTxParams,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignMessageParams,
  SignTransferTxParams,
  SignUnsignedTxParams
} from '@alephium/web3'
import { calcExpiry, getSdkError } from '@walletconnect/utils'
import { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { showToast } from '@/features/toastMessages/toastMessagesActions'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { cleanHistory, cleanMessages, getChainedTxSignersPublicKeys } from '@/features/walletConnect/walletConnectUtils'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
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
    const { isLoading: isLoadingAddressesBalances } = useFetchWalletBalancesByAddress()
    const { walletConnectClient, respondToWalletConnectWithError, respondToWalletConnect, getDappIcon } =
      useWalletConnectContext()
    const addresses = useUnsortedAddresses()
    const dispatch = useAppDispatch()
    const { sendAnalytics } = useAnalytics()
    const { t } = useTranslation()
    const { addressesWithGroup } = useAppSelector(selectAllAddressByType)
    const currentlyOnlineNetworkId = useCurrentlyOnlineNetworkId()

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

        const getSignerAddressByHash = (hash: string) => {
          const address = addresses.find((a) => a.hash === hash)
          if (!address) throw new Error(`Unknown signer address: ${hash}`)

          return address
        }

        const {
          params: { request, chainId }
        } = event

        let transactionParams: TransactionParams | undefined = undefined

        try {
          const { networkId } = parseChain(chainId)
          const showNetworkWarning =
            !!networkId &&
            currentlyOnlineNetworkId !== undefined &&
            !isNetworkValid(networkId, currentlyOnlineNetworkId)

          if (showNetworkWarning) {
            dispatch(
              openModal({
                name: 'NetworkSwitchModal',
                onUserDismiss: () => respondToWalletConnectWithError(event, getSdkError('USER_REJECTED')),
                props: { networkId }
              })
            )

            respondToWalletConnectWithError(
              event,
              {
                message: 'Network mismatch',
                code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
              },
              false
            )

            return
          }

          try {
            switch (request.method as RelayMethod) {
              case 'alph_signAndSubmitTransferTx': {
                const txParams = request.params as SignTransferTxParams
                transactionParams = { type: 'TRANSFER', params: txParams }

                // Note: We might need to build sweep txs here by checking that the requested balances to be transfered
                // are exactly the same as the total balances of the signer address, like we do in the normal send flow.
                // That would make sense only if we have a single destination otherwise what should the sweep destination
                // address be?

                dispatch(toggleAppLoading(true))
                const unsignedBuiltTx = await throttledClient.txBuilder.buildTransferTx(
                  txParams,
                  getSignerAddressByHash(txParams.signerAddress).publicKey
                )
                dispatch(toggleAppLoading(false))

                dispatch(
                  openModal({
                    name: 'SignTransferTxModal',
                    onUserDismiss: () => respondToWalletConnectWithError(event, getSdkError('USER_REJECTED')),
                    props: {
                      txParams,
                      unsignedData: unsignedBuiltTx,
                      origin: 'walletconnect',
                      onError: (message) => {
                        respondToWalletConnectWithError(
                          event,
                          {
                            message,
                            code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                          },
                          false
                        )
                      },
                      onSuccess: (result) => respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result }),
                      dAppIcon: getDappIcon(event.topic),
                      dAppUrl: event.verifyContext.verified.origin
                    }
                  })
                )

                break
              }
              case 'alph_signAndSubmitDeployContractTx': {
                const txParams = event.params.request.params as SignDeployContractTxParams
                transactionParams = { type: 'DEPLOY_CONTRACT', params: txParams }

                dispatch(toggleAppLoading(true))
                const unsignedData = await throttledClient.txBuilder.buildDeployContractTx(
                  txParams,
                  getSignerAddressByHash(txParams.signerAddress).publicKey
                )
                dispatch(toggleAppLoading(false))

                dispatch(
                  openModal({
                    name: 'SignDeployContractTxModal',
                    onUserDismiss: () => respondToWalletConnectWithError(event, getSdkError('USER_REJECTED')),
                    props: {
                      dAppUrl: event.verifyContext.verified.origin,
                      dAppIcon: getDappIcon(event.topic),
                      txParams,
                      unsignedData,
                      origin: 'walletconnect',
                      onError: (message) => {
                        respondToWalletConnectWithError(
                          event,
                          {
                            message,
                            code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                          },
                          false
                        )
                      },
                      onSuccess: (result) => respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })
                    }
                  })
                )

                break
              }
              case 'alph_signAndSubmitExecuteScriptTx': {
                const txParams = event.params.request.params as SignExecuteScriptTxParams
                transactionParams = { type: 'EXECUTE_SCRIPT', params: txParams }

                dispatch(toggleAppLoading(true))
                const unsignedBuiltTx = await throttledClient.txBuilder.buildExecuteScriptTx(
                  txParams,
                  getSignerAddressByHash(txParams.signerAddress).publicKey
                )
                dispatch(toggleAppLoading(false))

                dispatch(
                  openModal({
                    name: 'SignExecuteScriptTxModal',
                    onUserDismiss: () => respondToWalletConnectWithError(event, getSdkError('USER_REJECTED')),
                    props: {
                      dAppUrl: event.verifyContext.verified.origin,
                      dAppIcon: getDappIcon(event.topic),
                      txParams,
                      unsignedData: unsignedBuiltTx,
                      origin: 'walletconnect',
                      onError: (message) => {
                        respondToWalletConnectWithError(
                          event,
                          {
                            message,
                            code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                          },
                          false
                        )
                      },
                      onSuccess: (result) => respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })
                    }
                  })
                )

                break
              }
              case 'alph_signMessage': {
                const signParams = event.params.request.params as SignMessageParams

                dispatch(
                  openModal({
                    name: 'SignMessageTxModal',
                    onUserDismiss: () => respondToWalletConnectWithError(event, getSdkError('USER_REJECTED')),
                    props: {
                      dAppUrl: event.verifyContext.verified.origin,
                      dAppIcon: getDappIcon(event.topic),
                      txParams: signParams,
                      unsignedData: signParams.message,
                      origin: 'walletconnect',
                      onError: (message) => {
                        respondToWalletConnectWithError(
                          event,
                          {
                            message,
                            code: WALLETCONNECT_ERRORS.MESSAGE_SIGN_FAILED
                          },
                          false
                        )
                      },
                      onSuccess: (result) => respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })
                    }
                  })
                )

                break
              }
              case 'alph_signUnsignedTx':
              case 'alph_signAndSubmitUnsignedTx': {
                const txParams = event.params.request.params as SignUnsignedTxParams
                const submitAfterSign = event.params.request.method === 'alph_signAndSubmitUnsignedTx'

                dispatch(toggleAppLoading(true))
                const decodedTx = await queryClient.fetchQuery(
                  nodeTransactionDecodeUnsignedTxQuery({
                    unsignedTx: txParams.unsignedTx,
                    networkId: currentlyOnlineNetworkId
                  })
                )
                dispatch(toggleAppLoading(false))

                dispatch(
                  openModal({
                    name: 'SignUnsignedTxModal',
                    onUserDismiss: () => respondToWalletConnectWithError(event, getSdkError('USER_REJECTED')),
                    props: {
                      dAppUrl: event.verifyContext.verified.origin,
                      dAppIcon: getDappIcon(event.topic),
                      txParams,
                      unsignedData: decodedTx,
                      submitAfterSign,
                      origin: 'walletconnect',
                      onError: (message) => {
                        respondToWalletConnectWithError(
                          event,
                          {
                            message,
                            code: submitAfterSign
                              ? WALLETCONNECT_ERRORS.TRANSACTION_SIGN_FAILED
                              : WALLETCONNECT_ERRORS.MESSAGE_SIGN_FAILED
                          },
                          false
                        )
                      },
                      onSuccess: (result) => respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })
                    }
                  })
                )

                break
              }
              case 'alph_signAndSubmitChainedTx': {
                const txParams = event.params.request.params as SignChainedTxParams[]

                dispatch(toggleAppLoading(true))
                const publicKeys = await getChainedTxSignersPublicKeys(txParams)
                const unsignedData = await throttledClient.txBuilder.buildChainedTx(txParams, publicKeys)
                dispatch(toggleAppLoading(false))

                dispatch(
                  openModal({
                    name: 'SignChainedTxModal',
                    onUserDismiss: () => respondToWalletConnectWithError(event, getSdkError('USER_REJECTED')),
                    props: {
                      props: getChainedTxPropsFromSignChainedTxParams(txParams, unsignedData),
                      txParams,
                      onSuccess: (result) => respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result }),
                      dAppUrl: event.verifyContext.verified.origin,
                      dAppIcon: getDappIcon(event.topic),
                      origin: 'walletconnect',
                      onError: (message) => {
                        respondToWalletConnectWithError(
                          event,
                          {
                            message,
                            code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                          },
                          false
                        )
                      }
                    }
                  })
                )

                break
              }
              case 'alph_requestNodeApi': {
                walletConnectClient.core.expirer.set(event.id, calcExpiry(5))
                const p = request.params as ApiRequestArguments
                const result = await throttledClient.node.request(p)

                await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result }, false)
                await cleanStorage(event)
                break
              }
              case 'alph_requestExplorerApi': {
                walletConnectClient.core.expirer.set(event.id, calcExpiry(5))
                const p = request.params as ApiRequestArguments
                const result = await throttledClient.explorer.request(p)

                await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result }, false)
                await cleanStorage(event)
                break
              }
              default:
                respondToWalletConnectWithError(event, getSdkError('WC_METHOD_UNSUPPORTED'), false)
                throw new Error(`Method not supported: ${request.method}`)
            }
          } catch (e) {
            if (isInsufficientFundsError(e) && transactionParams) {
              const chainedTxParams = await getRefillMissingBalancesChainedTxParams({
                transactionParams,
                addressesWithGroup,
                networkId: currentlyOnlineNetworkId
              })

              if (chainedTxParams) {
                const publicKeys = await getChainedTxSignersPublicKeys(chainedTxParams)
                const unsignedData = await throttledClient.txBuilder.buildChainedTx(chainedTxParams, publicKeys)

                dispatch(
                  openModal({
                    name: 'SignChainedTxModal',
                    onUserDismiss: () => respondToWalletConnectWithError(event, getSdkError('USER_REJECTED')),
                    props: {
                      props: getChainedTxPropsFromSignChainedTxParams(chainedTxParams, unsignedData),
                      txParams: chainedTxParams,
                      onSuccess: (result) => respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result }),
                      dAppUrl: event.verifyContext.verified.origin,
                      dAppIcon: getDappIcon(event.topic),
                      origin: 'walletconnect:insufficient-funds',
                      onError: (message) => {
                        respondToWalletConnectWithError(
                          event,
                          {
                            message,
                            code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                          },
                          false
                        )
                      }
                    }
                  })
                )
              } else throw e
            } else if (isConsolidationError(e)) {
              dispatch(
                showToast({
                  text: t(
                    'It appears that your wallet has too many UTXOs to be able to send this transaction. Please, consolidate (merge) your UTXOs first. This will cost a small fee.'
                  ),
                  duration: 'long'
                })
              )
            } else throw e
          }
        } catch (e) {
          const message = 'Could not parse WalletConnect session request'
          const errorMessage = getHumanReadableError(e, message)

          dispatch(showToast({ text: errorMessage, duration: 'long', type: 'error' }))
          sendAnalytics({ type: 'error', error: e, message })
          respondToWalletConnectWithError(
            event,
            { message: errorMessage, code: WALLETCONNECT_ERRORS.PARSING_SESSION_REQUEST_FAILED },
            false
          )
        }
      },
      [
        addresses,
        addressesWithGroup,
        cleanStorage,
        currentlyOnlineNetworkId,
        dispatch,
        getDappIcon,
        respondToWalletConnect,
        respondToWalletConnectWithError,
        sendAnalytics,
        t,
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
