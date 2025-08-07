import {
  getAddressesInGroup,
  getChainedTxPropsFromSignChainedTxParams,
  getNetworkIdFromNetworkName,
  isInsufficientFundsError,
  NetworkName,
  selectAllAddressByType,
  SignTxModalCommonProps,
  throttledClient
} from '@alephium/shared'
import {
  buildDeployContractTxQuery,
  buildExecuteScriptTxQuery,
  buildTransferTxQuery,
  decodeUnsignedTxQuery,
  getRefillMissingBalancesChainedTxParams,
  queryClient,
  useCurrentlyOnlineNetworkId,
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
import { createContext, ReactNode, RefObject, useCallback, useContext, useEffect, useRef } from 'react'
import WebView from 'react-native-webview'

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
import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import {
  getChainedTxPropsFromTransactionParams,
  getChainedTxSignersPublicKeys,
  getConnectedAddressPayload,
  txParamsToChainedTxParams,
  useNetwork,
  validateChainedTxsNetwork
} from '~/features/ecosystem/dAppMessaging/dAppMessagingUtils'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { signer } from '~/signer'
import { showToast, ToastDuration } from '~/utils/layout'

type DappBrowserContextValue = RefObject<WebView>

const DappBrowserContext = createContext<DappBrowserContextValue | null>(null)

interface DappBrowserContextProviderProps {
  children: ReactNode
  dAppUrl: string
  dAppName?: string
}

export const DappBrowserContextProvider = ({ children, dAppUrl, dAppName }: DappBrowserContextProviderProps) => {
  const webViewRef = useRef<WebView>(null)
  const dAppMessage = useAppSelector(selectCurrentlyProcessingDappMessage)
  const currentlyOnlineNetworkId = useCurrentlyOnlineNetworkId()
  const addresses = useUnsortedAddresses()
  const { addressesWithGroup } = useAppSelector(selectAllAddressByType)
  const network = useNetwork()
  const dispatch = useAppDispatch()

  const replyToDapp = useCallback(
    (message: MessageType, messageId: string) => {
      console.log('✈️ Replying to dApp with:', message)
      webViewRef.current?.postMessage(JSON.stringify(message))
      dispatch(respondedToDappMessage(messageId))
    },
    [dispatch]
  )

  const handleIsDappPreauthorized = useCallback(
    (data: RequestOptions, messageId: string) => {
      const isPreauthorized = isConnectionAuthorized(data)

      if (!isPreauthorized && !isConnectTipShownOnce()) {
        dispatch(openModal({ name: 'ConnectTipModal' }))
        setConnectTipShownOnce()
      }

      replyToDapp({ type: 'ALPH_IS_PREAUTHORIZED_RES', data: isPreauthorized }, messageId)
    },
    [dispatch, replyToDapp]
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
    async (data: ConnectDappMessageData, messageId: string) => {
      const authorizedConnection = getAuthorizedConnection(data)

      const isWrongNetwork =
        data.networkId !== undefined &&
        currentlyOnlineNetworkId !== getNetworkIdFromNetworkName(data.networkId as NetworkName)

      if (isWrongNetwork) {
        dispatch(
          openModal({
            name: 'NetworkSwitchModal',
            onUserDismiss: () => handleRejectDappConnection(data.host, messageId),
            props: { ...data, dAppName }
          })
        )

        return
      }

      if (authorizedConnection) {
        const address = addresses.find((a) => a.hash === authorizedConnection.address)
        if (!address) {
          dispatch(connectionRemoved(authorizedConnection))
        } else {
          const connectedAddressPayload = await getConnectedAddressPayload(network, address, data.host, data.icon)
          handleApproveDappConnection(connectedAddressPayload, messageId)
          return
        }
      }

      const addressesInGroup = getAddressesInGroup(addresses, data.group)

      // Select address automatically if there is only one address in the group
      if (addressesInGroup.length === 1) {
        const connectedAddressPayload = await getConnectedAddressPayload(
          network,
          addressesInGroup[0],
          data.host,
          data.icon
        )
        handleApproveDappConnection(connectedAddressPayload, messageId)

        return
      }

      dispatch(
        openModal({
          name: 'ConnectDappModal',
          onUserDismiss: () => handleRejectDappConnection(data.host, messageId),
          props: {
            ...data,
            dAppName,
            onApprove: (data) => handleApproveDappConnection(data, messageId)
          }
        })
      )
    },
    [
      addresses,
      currentlyOnlineNetworkId,
      dAppName,
      dispatch,
      handleApproveDappConnection,
      handleRejectDappConnection,
      network
    ]
  )

  const handleExecuteTransaction = useCallback(
    async ({ txParams, icon: dAppIcon }: ExecuteTransactionMessageData, messageId: string) => {
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
            dAppUrl: params.host ?? dAppUrl,
            dAppIcon,
            origin: 'in-app-browser',
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
                const decodedResult = await queryClient.fetchQuery(
                  decodeUnsignedTxQuery({ unsignedTx: params.unsignedTx })
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
                      unsignedData: decodedResult.unsignedTx,
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
                networkId: currentlyOnlineNetworkId
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
                      dAppUrl,
                      dAppIcon,
                      origin: 'in-app-browser:insufficient-funds',
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
                dAppUrl,
                dAppIcon,
                origin: 'in-app-browser',
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
    [addressesWithGroup, currentlyOnlineNetworkId, dAppUrl, dispatch, replyToDapp]
  )

  const handleSignUnsignedTx = useCallback(
    async (data: SignUnsignedTxMessageData, messageId: string) => {
      const { unsignedTx, host, icon } = data
      const actionHash = messageId

      replyToDapp({ type: 'ALPH_SIGN_UNSIGNED_TX_RES', data: { actionHash } }, messageId)

      dispatch(activateAppLoading('Loading'))
      const decodedResult = await throttledClient.node.transactions.postTransactionsDecodeUnsignedTx({ unsignedTx })
      dispatch(deactivateAppLoading())

      dispatch(
        openModal({
          name: 'SignUnsignedTxModal',
          onUserDismiss: () =>
            replyToDapp(
              { type: 'ALPH_SIGN_UNSIGNED_TX_FAILURE', data: { actionHash, error: 'User rejected' } },
              messageId
            ),
          props: {
            dAppUrl: host ?? dAppUrl,
            dAppIcon: icon,
            txParams: data,
            unsignedData: decodedResult.unsignedTx,
            submitAfterSign: false,
            origin: 'in-app-browser',
            onError: (error) =>
              replyToDapp({ type: 'ALPH_SIGN_UNSIGNED_TX_FAILURE', data: { actionHash, error } }, messageId),
            onSuccess: (result) =>
              replyToDapp({ type: 'ALPH_SIGN_UNSIGNED_TX_SUCCESS', data: { result, actionHash } }, messageId)
          }
        })
      )
    },
    [dAppUrl, dispatch, replyToDapp]
  )

  const handleSignMessage = useCallback(
    async (data: SignMessageMessageData, messageId: string) => {
      const actionHash = messageId

      replyToDapp({ type: 'ALPH_SIGN_MESSAGE_RES', data: { actionHash } }, messageId)

      dispatch(
        openModal({
          name: 'SignMessageTxModal',
          onUserDismiss: () =>
            replyToDapp({ type: 'ALPH_SIGN_MESSAGE_FAILURE', data: { actionHash, error: 'User rejected' } }, messageId),
          props: {
            dAppUrl: data.host ?? dAppUrl,
            dAppIcon: data.icon,
            txParams: data,
            unsignedData: data.message,
            origin: 'in-app-browser',
            onError: (error) =>
              replyToDapp({ type: 'ALPH_SIGN_MESSAGE_FAILURE', data: { actionHash, error } }, messageId),
            onSuccess: (result) =>
              replyToDapp({ type: 'ALPH_SIGN_MESSAGE_SUCCESS', data: { ...result, actionHash } }, messageId)
          }
        })
      )
    },
    [dAppUrl, dispatch, replyToDapp]
  )

  useEffect(() => {
    if (!dAppMessage || currentlyOnlineNetworkId === undefined) return

    switch (dAppMessage.type) {
      case 'ALPH_IS_PREAUTHORIZED':
        handleIsDappPreauthorized(dAppMessage.data, dAppMessage.id)
        break
      case 'ALPH_REMOVE_PREAUTHORIZATION':
        handleRemovePreAuthorization(dAppMessage.data, dAppMessage.id)
        break
      case 'ALPH_REJECT_PREAUTHORIZATION':
        handleRejectDappConnection(dAppMessage.data.host, dAppMessage.id)
        break
      case 'ALPH_CONNECT_DAPP':
        handleConnectDapp(dAppMessage.data, dAppMessage.id)
        break
      case 'ALPH_EXECUTE_TRANSACTION':
        handleExecuteTransaction(dAppMessage.data, dAppMessage.id)
        break
      case 'ALPH_SIGN_UNSIGNED_TX':
        handleSignUnsignedTx(dAppMessage.data, dAppMessage.id)
        break
      case 'ALPH_SIGN_MESSAGE':
        handleSignMessage(dAppMessage.data, dAppMessage.id)
        break
    }
  }, [
    currentlyOnlineNetworkId,
    dAppMessage,
    handleConnectDapp,
    handleExecuteTransaction,
    handleIsDappPreauthorized,
    handleRejectDappConnection,
    handleRemovePreAuthorization,
    handleSignMessage,
    handleSignUnsignedTx
  ])

  return <DappBrowserContext.Provider value={webViewRef}>{children}</DappBrowserContext.Provider>
}

export const useDappBrowserContext = () => {
  const context = useContext(DappBrowserContext)

  if (!context) {
    throw new Error('useDappBrowserContext must be used within a DappBrowserContextProvider')
  }

  return context
}
