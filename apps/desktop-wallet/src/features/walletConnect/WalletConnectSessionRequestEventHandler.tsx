import { getHumanReadableError, SessionRequestEvent, throttledClient, WALLETCONNECT_ERRORS } from '@alephium/shared'
import { useFetchWalletBalancesByAddress, useUnsortedAddresses } from '@alephium/shared-react'
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
import { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { showToast } from '@/features/toastMessages/toastMessagesActions'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { SignMessageData, SignUnsignedTxData } from '@/features/walletConnect/walletConnectTypes'
import { cleanHistory, cleanMessages } from '@/features/walletConnect/walletConnectUtils'
import { useAppDispatch } from '@/hooks/redux'
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
          params: { request }
        } = event

        try {
          switch (request.method as RelayMethod) {
            case 'alph_signAndSubmitTransferTx': {
              const txParams = request.params as SignTransferTxParams

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
                      respondToWalletConnectWithError(event, {
                        message,
                        code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                      })
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
                      respondToWalletConnectWithError(event, {
                        message,
                        code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                      })
                    },
                    onSuccess: (result) => respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })
                  }
                })
              )

              break
            }
            case 'alph_signAndSubmitExecuteScriptTx': {
              const txParams = event.params.request.params as SignExecuteScriptTxParams

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
                      respondToWalletConnectWithError(event, {
                        message,
                        code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                      })
                    },
                    onSuccess: (result) => respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })
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
        } catch (e) {
          const message = 'Could not parse WalletConnect session request'

          sendAnalytics({ type: 'error', error: e, message })
          respondToWalletConnectWithError(event, {
            message: getHumanReadableError(e, message),
            code: WALLETCONNECT_ERRORS.PARSING_SESSION_REQUEST_FAILED
          })

          // https://github.com/alephium/alephium-frontend/issues/610
          const error = (e as unknown as string).toString()

          if (error.includes('consolidating') || error.includes('consolidate')) {
            showToast({
              text: t(
                'It appears that your wallet has too many UTXOs to be able to send this transaction. Please, consolidate (merge) your UTXOs first. This will cost a small fee.'
              ),
              duration: 'long'
            })
          }
        }
      },
      [
        addresses,
        cleanStorage,
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
