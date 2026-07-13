import { AnalyticsEvent, isDappMessageHasherAllowed } from '@alephium/shared'
import { throttledClient } from '@alephium/shared/api'
import { selectAllAddressByType } from '@alephium/shared/store'
import { getChainedTxPropsFromSignChainedTxParams } from '@alephium/shared/transactions'
import { NetworkName, SignTxModalCommonProps } from '@alephium/shared/types'
import { getNetworkIdFromNetworkName, isInsufficientFundsError } from '@alephium/shared/utils'
import {
  buildDeployContractTxQuery,
  buildExecuteScriptTxQuery,
  buildTransferTxQuery,
  getRefillMissingBalancesChainedTxParams,
  nodeTransactionDecodeUnsignedTxQuery,
  queryClient,
  useIsNodeOnline,
  useNetworkId,
  useUnsortedAddresses
} from '@alephium/shared-react'
import {
  ConnectDappMessageData,
  ExecuteTransactionMessageData,
  MessageType,
  RequestOptions,
  SignMessageMessageData,
  SignUnsignedTxMessageData
} from '@alephium/wallet-dapp-provider'
import { stringify } from '@alephium/web3'
import { createContext, ReactNode, RefObject, useCallback, useContext, useEffect, useRef } from 'react'
import WebView from 'react-native-webview'

import { sendAnalytics } from '~/analytics'
import { isConnectTipShownOnce, setConnectTipShownOnce } from '~/features/connectTip/connectTipStorage'
import {
  connectionAuthorized,
  connectionRemoved,
  hostConnectionRemoved
} from '~/features/ecosystem/authorizedConnections/authorizedConnectionsActions'
import {
  getAuthorizedConnection,
  isConnectionAuthorized
} from '~/features/ecosystem/authorizedConnections/persistedAuthorizedConnectionsStorage'
import { respondedToDappMessage } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueActions'
import { selectCurrentlyProcessingDappMessage } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueSelectors'
import { DappMessage } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueTypes'
import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import {
  getChainedTxPropsFromTransactionParams,
  getChainedTxSignersPublicKeys,
  getConnectedAddressPayload,
  txParamsToChainedTxParams,
  useNetwork,
  validateChainedTxsNetwork
} from '~/features/ecosystem/dAppMessaging/dAppMessagingUtils'
import { getHostFromUrl } from '~/features/ecosystem/ecosystemUtils'
import useUnverifiedDappGuard from '~/features/ecosystem/unverifiedDapps/useUnverifiedDappGuard'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { openModal } from '~/features/modals/modalActions'
import { selectIsConnectToDappModalOpen } from '~/features/modals/modalSelectors'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { signer } from '~/signer'
import { showToast, ToastDuration } from '~/utils/layout'

type DappBrowserContextValue = RefObject<WebView | null>

const DappBrowserContext = createContext<DappBrowserContextValue | null>(null)

interface DappBrowserContextProviderProps {
  children: ReactNode
  dAppName?: string
}

export const DappBrowserContextProvider = ({ children, dAppName }: DappBrowserContextProviderProps) => {
  const webViewRef = useRef<WebView>(null)
  const dAppMessage = useAppSelector(selectCurrentlyProcessingDappMessage)
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()
  const addresses = useUnsortedAddresses()
  const { addressesWithGroup } = useAppSelector(selectAllAddressByType)
  const walletId = useAppSelector((s) => s.wallet.id)
  const network = useNetwork()
  const dispatch = useAppDispatch()
  const isConnectToDappModalOpen = useAppSelector(selectIsConnectToDappModalOpen)
  const { triggerUnverifiedDappGuard } = useUnverifiedDappGuard()

  const replyToDapp = useCallback(
    (message: MessageType, messageId: string) => {
      console.log('✈️ Replying to dApp with:', message)
      webViewRef.current?.postMessage(stringify(message))
      dispatch(respondedToDappMessage(messageId))
    },
    [dispatch]
  )

  const handleIsDappPreauthorized = useCallback(
    (data: RequestOptions, messageId: string, senderHost: string) => {
      const isPreauthorized = isConnectionAuthorized(walletId, { ...data, host: senderHost })

      if (!isPreauthorized && !isConnectTipShownOnce()) {
        dispatch(openModal({ name: 'ConnectTipModal' }))
        setConnectTipShownOnce()
      }

      replyToDapp({ type: 'ALPH_IS_PREAUTHORIZED_RES', data: isPreauthorized }, messageId)
    },
    [dispatch, replyToDapp, walletId]
  )

  const handleRejectDappConnection = useCallback(
    (host: string, messageId: string) =>
      replyToDapp({ type: 'ALPH_REJECT_PREAUTHORIZATION', data: { host, actionHash: messageId } }, messageId),
    [replyToDapp]
  )

  const handleRemovePreAuthorization = useCallback(
    (host: string, messageId: string) => {
      dispatch(hostConnectionRemoved(host))
      replyToDapp({ type: 'ALPH_REMOVE_PREAUTHORIZATION_RES' }, messageId)
    },
    [dispatch, replyToDapp]
  )

  const handleApproveDappConnection = useCallback(
    (data: ConnectedAddressPayload, messageId: string) => {
      dispatch(connectionAuthorized(data))
      replyToDapp({ type: 'ALPH_CONNECT_DAPP_RES', data }, messageId)
    },
    [dispatch, replyToDapp]
  )

  const handleConnectDapp = useCallback(
    (data: ConnectDappMessageData, messageId: string, senderHost: string) => {
      if (isConnectToDappModalOpen) return

      // Always bind the connection to the real origin, never to the host the page claims in the message body.
      const requestOptions = { ...data, host: senderHost }

      const connectToDapp = async () => {
        try {
          const authorizedConnection = getAuthorizedConnection(walletId, requestOptions)

          const isWrongNetwork =
            data.networkId !== undefined && networkId !== getNetworkIdFromNetworkName(data.networkId as NetworkName)

          if (isWrongNetwork) {
            dispatch(
              openModal({
                name: 'NetworkSwitchModal',
                onUserDismiss: () => handleRejectDappConnection(senderHost, messageId),
                props: { ...requestOptions, dAppName }
              })
            )

            return
          }

          if (authorizedConnection) {
            const address = addresses.find((a) => a.hash === authorizedConnection.address)
            if (!address) {
              dispatch(connectionRemoved(authorizedConnection))
            } else {
              const connectedAddressPayload = await getConnectedAddressPayload(network, address, senderHost, data.icon)
              handleApproveDappConnection(connectedAddressPayload, messageId)
              return
            }
          }

          // Only the prompted connection is tracked. The `authorizedConnection` branch above silently
          // re-connects a dApp the user already approved, so counting it would inflate connections and
          // produce a 'connected' with no matching 'requested'.
          sendAnalytics({
            event: AnalyticsEvent.DAPP_CONNECTION_REQUESTED,
            props: { origin: 'in_app_browser', dapp_host: senderHost, dapp_name: dAppName }
          })

          dispatch(
            openModal({
              name: 'ConnectDappModal',
              onUserDismiss: () => handleRejectDappConnection(senderHost, messageId),
              props: {
                ...requestOptions,
                dAppName,
                onApprove: (data) => {
                  handleApproveDappConnection(data, messageId)

                  sendAnalytics({
                    event: AnalyticsEvent.DAPP_CONNECTED,
                    props: { origin: 'in_app_browser', dapp_host: senderHost, dapp_name: dAppName }
                  })
                }
              }
            })
          )
        } catch (error) {
          console.error('Error handling ALPH_CONNECT_DAPP:', error)
          handleRejectDappConnection(senderHost, messageId)
        }
      }

      triggerUnverifiedDappGuard({
        dAppHost: getHostFromUrl(senderHost) ?? senderHost,
        orReject: () => handleRejectDappConnection(senderHost, messageId),
        onConfirm: () => {
          connectToDapp()
        }
      })
    },
    [
      addresses,
      dAppName,
      dispatch,
      handleApproveDappConnection,
      handleRejectDappConnection,
      isConnectToDappModalOpen,
      network,
      networkId,
      triggerUnverifiedDappGuard,
      walletId
    ]
  )

  const handleExecuteTransaction = useCallback(
    async ({ txParams, icon: dAppIcon }: ExecuteTransactionMessageData, messageId: string, senderHost: string) => {
      const actionHash = messageId
      replyToDapp({ type: 'ALPH_EXECUTE_TRANSACTION_RES', data: { actionHash } }, messageId)

      if (txParams.length === 0) {
        replyToDapp(
          { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'No transactions to execute' } },
          messageId
        )

        return
      }

      dispatch(activateAppLoading('Loading'))

      try {
        if (txParams.length === 1) {
          const { type, params } = txParams[0]

          const commonModalProps: SignTxModalCommonProps = {
            dAppUrl: senderHost,
            dAppIcon,
            origin: 'in_app_browser',
            onError: (error) => replyToDapp({ type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error } }, messageId)
          }

          try {
            switch (type) {
              case 'TRANSFER': {
                // Note: We might need to build sweep txs here by checking that the requested balances to be transfered
                // are exactly the same as the total balances of the signer address, like we do in the normal send flow.
                // That would make sense only if we have a single destination otherwise what should the sweep destination
                // address be?

                const publicKey = await signer.getPublicKey(params.signerAddress)
                const unsignedData = await queryClient.fetchQuery(buildTransferTxQuery({ params, publicKey }))

                dispatch(
                  openModal({
                    name: 'SignTransferTxModal',
                    onUserDismiss: () =>
                      replyToDapp(
                        { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'User rejected' } },
                        messageId
                      ),
                    props: {
                      txParams: params,
                      unsignedData,
                      onSuccess: (result) =>
                        replyToDapp(
                          { type: 'ALPH_TRANSACTION_SUBMITTED', data: { result: [{ type, result }], actionHash } },
                          messageId
                        ),
                      ...commonModalProps
                    }
                  })
                )

                break
              }

              case 'EXECUTE_SCRIPT': {
                const publicKey = await signer.getPublicKey(params.signerAddress)
                const unsignedData = await queryClient.fetchQuery(buildExecuteScriptTxQuery({ params, publicKey }))

                dispatch(
                  openModal({
                    name: 'SignExecuteScriptTxModal',
                    onUserDismiss: () =>
                      replyToDapp(
                        { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'User rejected' } },
                        messageId
                      ),
                    props: {
                      txParams: params,
                      unsignedData,
                      onSuccess: (result) =>
                        replyToDapp(
                          { type: 'ALPH_TRANSACTION_SUBMITTED', data: { result: [{ type, result }], actionHash } },
                          messageId
                        ),
                      ...commonModalProps
                    }
                  })
                )

                break
              }
              case 'DEPLOY_CONTRACT': {
                const publicKey = await signer.getPublicKey(params.signerAddress)
                const unsignedData = await queryClient.fetchQuery(buildDeployContractTxQuery({ params, publicKey }))

                dispatch(
                  openModal({
                    name: 'SignDeployContractTxModal',
                    onUserDismiss: () =>
                      replyToDapp(
                        { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'User rejected' } },
                        messageId
                      ),
                    props: {
                      txParams: params,
                      unsignedData,
                      onSuccess: (result) =>
                        replyToDapp(
                          { type: 'ALPH_TRANSACTION_SUBMITTED', data: { result: [{ type, result }], actionHash } },
                          messageId
                        ),
                      ...commonModalProps
                    }
                  })
                )
                break
              }
              case 'UNSIGNED_TX': {
                // We could be using unsignedTxCodec.decodeApiUnsignedTx(hexToBinUnsafe(unsignedTx)) but then we get
                // problems with unpolyfilled crypto Node JS module.
                const decodedTx = await queryClient.fetchQuery(
                  nodeTransactionDecodeUnsignedTxQuery({
                    unsignedTx: params.unsignedTx,
                    networkId,
                    isNodeOnline
                  })
                )

                dispatch(
                  openModal({
                    name: 'SignUnsignedTxModal',
                    onUserDismiss: () =>
                      replyToDapp(
                        { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'User rejected' } },
                        messageId
                      ),
                    props: {
                      txParams: params,
                      unsignedData: decodedTx,
                      submitAfterSign: true,
                      onSuccess: (result) =>
                        replyToDapp(
                          { type: 'ALPH_TRANSACTION_SUBMITTED', data: { result: [{ type, result }], actionHash } },
                          messageId
                        ),
                      ...commonModalProps
                    }
                  })
                )
                break
              }
            }
          } catch (e) {
            if (isInsufficientFundsError(e)) {
              const chainedTxParams = await getRefillMissingBalancesChainedTxParams({
                transactionParams: txParams[0],
                addressesWithGroup,
                networkId,
                isNodeOnline
              })

              if (chainedTxParams) {
                const publicKeys = await getChainedTxSignersPublicKeys(chainedTxParams)
                const unsignedData = await throttledClient.txBuilder.buildChainedTx(chainedTxParams, publicKeys)

                dispatch(
                  openModal({
                    name: 'SignChainedTxModal',
                    onUserDismiss: () =>
                      replyToDapp(
                        { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'User rejected' } },
                        messageId
                      ),
                    props: {
                      props: getChainedTxPropsFromSignChainedTxParams(chainedTxParams, unsignedData),
                      txParams: chainedTxParams,
                      onSuccess: (result) =>
                        replyToDapp({ type: 'ALPH_TRANSACTION_SUBMITTED', data: { result, actionHash } }, messageId),
                      dAppUrl: senderHost,
                      dAppIcon,
                      origin: 'in_app_browser:insufficient_funds',
                      onError: (error) =>
                        replyToDapp({ type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error } }, messageId)
                    }
                  })
                )
              } else throw e
            } else throw e
          }
        } else {
          validateChainedTxsNetwork(txParams)

          const chainedTxParams = txParamsToChainedTxParams(txParams)
          const publicKeys = await getChainedTxSignersPublicKeys(chainedTxParams)
          const unsignedData = await throttledClient.txBuilder.buildChainedTx(chainedTxParams, publicKeys)

          dispatch(
            openModal({
              name: 'SignChainedTxModal',
              onUserDismiss: () =>
                replyToDapp(
                  { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'User rejected' } },
                  messageId
                ),
              props: {
                props: getChainedTxPropsFromTransactionParams(txParams, unsignedData),
                txParams: chainedTxParams,
                onSuccess: (result) =>
                  replyToDapp({ type: 'ALPH_TRANSACTION_SUBMITTED', data: { result, actionHash } }, messageId),
                dAppUrl: senderHost,
                dAppIcon,
                origin: 'in_app_browser',
                onError: (error) =>
                  replyToDapp({ type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error } }, messageId)
              }
            })
          )
        }
      } catch (errorMessage) {
        const error = `${errorMessage}`

        replyToDapp({ type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error } }, messageId)
        showToast({
          text1: 'Could not build transaction',
          text2: error,
          type: 'error',
          visibilityTime: ToastDuration.LONG
        })
      } finally {
        dispatch(deactivateAppLoading())
      }
    },
    [addressesWithGroup, dispatch, isNodeOnline, networkId, replyToDapp]
  )

  const handleSignUnsignedTx = useCallback(
    async (data: SignUnsignedTxMessageData, messageId: string, senderHost: string) => {
      const { unsignedTx, icon } = data
      const actionHash = messageId

      replyToDapp({ type: 'ALPH_SIGN_UNSIGNED_TX_RES', data: { actionHash } }, messageId)

      dispatch(activateAppLoading('Loading'))

      try {
        const decodedTx = await queryClient.fetchQuery(
          nodeTransactionDecodeUnsignedTxQuery({ unsignedTx, networkId, isNodeOnline })
        )

        dispatch(
          openModal({
            name: 'SignUnsignedTxModal',
            onUserDismiss: () =>
              replyToDapp(
                { type: 'ALPH_SIGN_UNSIGNED_TX_FAILURE', data: { actionHash, error: 'User rejected' } },
                messageId
              ),
            props: {
              dAppUrl: senderHost,
              dAppIcon: icon,
              txParams: data,
              unsignedData: decodedTx,
              submitAfterSign: false,
              origin: 'in_app_browser',
              onError: (error) =>
                replyToDapp({ type: 'ALPH_SIGN_UNSIGNED_TX_FAILURE', data: { actionHash, error } }, messageId),
              onSuccess: (result) =>
                replyToDapp({ type: 'ALPH_SIGN_UNSIGNED_TX_SUCCESS', data: { result, actionHash } }, messageId)
            }
          })
        )
      } catch (error) {
        replyToDapp({ type: 'ALPH_SIGN_UNSIGNED_TX_FAILURE', data: { actionHash, error: `${error}` } }, messageId)
      } finally {
        dispatch(deactivateAppLoading())
      }
    },
    [replyToDapp, dispatch, networkId, isNodeOnline]
  )

  const handleSignMessage = useCallback(
    async (data: SignMessageMessageData, messageId: string, senderHost: string) => {
      const actionHash = messageId

      if (!isDappMessageHasherAllowed(data.messageHasher)) {
        replyToDapp(
          {
            type: 'ALPH_SIGN_MESSAGE_FAILURE',
            data: {
              actionHash,
              error: `Unsupported message hasher '${data.messageHasher}'. Only the 'alephium' message hasher is accepted.`
            }
          },
          messageId
        )
        return
      }

      replyToDapp({ type: 'ALPH_SIGN_MESSAGE_RES', data: { actionHash } }, messageId)

      dispatch(
        openModal({
          name: 'SignMessageTxModal',
          onUserDismiss: () =>
            replyToDapp({ type: 'ALPH_SIGN_MESSAGE_FAILURE', data: { actionHash, error: 'User rejected' } }, messageId),
          props: {
            dAppUrl: senderHost,
            dAppIcon: data.icon,
            txParams: data,
            unsignedData: data.message,
            origin: 'in_app_browser',
            onError: (error) =>
              replyToDapp({ type: 'ALPH_SIGN_MESSAGE_FAILURE', data: { actionHash, error } }, messageId),
            onSuccess: (result) =>
              replyToDapp({ type: 'ALPH_SIGN_MESSAGE_SUCCESS', data: { ...result, actionHash } }, messageId)
          }
        })
      )
    },
    [dispatch, replyToDapp]
  )

  const replyToDappWithVerifiedOrigin = useCallback(
    (message: DappMessage, senderHost: string) => {
      switch (message.type) {
        case 'ALPH_IS_PREAUTHORIZED':
          handleIsDappPreauthorized(message.data, message.id, senderHost)
          break
        case 'ALPH_REMOVE_PREAUTHORIZATION':
          handleRemovePreAuthorization(senderHost, message.id)
          break
        case 'ALPH_REJECT_PREAUTHORIZATION':
          handleRejectDappConnection(senderHost, message.id)
          break
        case 'ALPH_CONNECT_DAPP':
          handleConnectDapp(message.data, message.id, senderHost)
          break
        case 'ALPH_EXECUTE_TRANSACTION':
          handleExecuteTransaction(message.data, message.id, senderHost)
          break
        case 'ALPH_SIGN_UNSIGNED_TX':
          handleSignUnsignedTx(message.data, message.id, senderHost)
          break
        case 'ALPH_SIGN_MESSAGE':
          handleSignMessage(message.data, message.id, senderHost)
          break
        default:
          dispatch(respondedToDappMessage(message.id))
      }
    },
    [
      dispatch,
      handleConnectDapp,
      handleExecuteTransaction,
      handleIsDappPreauthorized,
      handleRejectDappConnection,
      handleRemovePreAuthorization,
      handleSignMessage,
      handleSignUnsignedTx
    ]
  )

  const replyToDappWithUnverifiableOriginError = useCallback(
    (message: DappMessage) => {
      const actionHash = message.id
      const error = 'Could not verify the origin of the request'

      switch (message.type) {
        case 'ALPH_IS_PREAUTHORIZED':
          replyToDapp({ type: 'ALPH_IS_PREAUTHORIZED_RES', data: false }, message.id)
          break
        case 'ALPH_REMOVE_PREAUTHORIZATION':
          replyToDapp({ type: 'ALPH_REMOVE_PREAUTHORIZATION_RES' }, message.id)
          break
        case 'ALPH_REJECT_PREAUTHORIZATION':
          replyToDapp({ type: 'ALPH_REJECT_PREAUTHORIZATION', data: { host: '', actionHash } }, message.id)
          break
        case 'ALPH_CONNECT_DAPP':
          replyToDapp({ type: 'ALPH_REJECT_PREAUTHORIZATION', data: { host: '', actionHash } }, message.id)
          break
        case 'ALPH_EXECUTE_TRANSACTION':
          replyToDapp({ type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error } }, message.id)
          break
        case 'ALPH_SIGN_UNSIGNED_TX':
          replyToDapp({ type: 'ALPH_SIGN_UNSIGNED_TX_FAILURE', data: { actionHash, error } }, message.id)
          break
        case 'ALPH_SIGN_MESSAGE':
          replyToDapp({ type: 'ALPH_SIGN_MESSAGE_FAILURE', data: { actionHash, error } }, message.id)
          break
        default:
          dispatch(respondedToDappMessage(message.id))
      }
    },
    [dispatch, replyToDapp]
  )

  useEffect(() => {
    if (!dAppMessage || !isNodeOnline) return

    const { senderHost } = dAppMessage

    if (senderHost) {
      return replyToDappWithVerifiedOrigin(dAppMessage, senderHost)
    }

    // If we cannot establish the real origin of the request (e.g. about:blank / blocked non-https scheme), refuse
    // it: reply with an error so the dApp doesn't hang, and drop it from the queue. This should not happen during
    // normal https dApp use.
    console.warn('Dropping dApp message with unverifiable origin:', dAppMessage.type)
    replyToDappWithUnverifiableOriginError(dAppMessage)
  }, [dAppMessage, isNodeOnline, replyToDappWithUnverifiableOriginError, replyToDappWithVerifiedOrigin])

  return <DappBrowserContext.Provider value={webViewRef}>{children}</DappBrowserContext.Provider>
}

export const useDappBrowserContext = () => {
  const context = useContext(DappBrowserContext)

  if (!context) {
    throw new Error('useDappBrowserContext must be used within a DappBrowserContextProvider')
  }

  return context
}
