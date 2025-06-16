import { getNetworkIdFromNetworkName, NetworkName } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId, useUnsortedAddresses } from '@alephium/shared-react'
import {
  ConnectDappMessageData,
  ExecuteTransactionMessageData,
  MessageType,
  RequestOptions
} from '@alephium/wallet-dapp-provider'
import { createContext, ReactNode, RefObject, useCallback, useContext, useEffect, useRef } from 'react'
import WebView from 'react-native-webview'

import { buildDeployContractTransaction } from '~/api/transactions'
import {
  connectionAuthorized,
  connectionRemoved
} from '~/features/ecosystem/authorizedConnections/authorizedConnectionsActions'
import {
  getAuthorizedConnection,
  isConnectionAuthorized
} from '~/features/ecosystem/authorizedConnections/persistedAuthorizedConnectionsStorage'
import { respondedToDappMessage } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueActions'
import { selectCurrentlyProcessingDappMessage } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueSelectors'
import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import { getConnectedAddressPayload, useNetwork } from '~/features/ecosystem/dAppMessaging/dAppMessagingUtils'
import {
  processSignExecuteScriptTxParamsAndBuildTx,
  processSignTransferTxParamsAndBuildTx
} from '~/features/ecosystem/utils'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { showToast } from '~/utils/layout'

type DappBrowserContextValue = RefObject<WebView>

const DappBrowserContext = createContext<DappBrowserContextValue | null>(null)

interface DappBrowserContextProviderProps {
  children: ReactNode
  dAppUrl: string
  dAppName: string
}

export const DappBrowserContextProvider = ({ children, dAppUrl, dAppName }: DappBrowserContextProviderProps) => {
  const webViewRef = useRef<WebView>(null)
  const dAppMessage = useAppSelector(selectCurrentlyProcessingDappMessage)
  const currentlyOnlineNetworkId = useCurrentlyOnlineNetworkId()
  const addresses = useUnsortedAddresses()
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
      replyToDapp({ type: 'ALPH_IS_PREAUTHORIZED_RES', data: isConnectionAuthorized(data) }, messageId)
    },
    [replyToDapp]
  )

  const handleRejectDappConnection = useCallback(
    (host: string, messageId: string) => {
      replyToDapp({ type: 'ALPH_REJECT_PREAUTHORIZATION', data: { host, actionHash: messageId } }, messageId)
    },
    [replyToDapp]
  )

  const handleRemovePreAuthorization = useCallback(
    (host: string, messageId: string) => {
      dispatch(connectionRemoved(host))
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

      if (authorizedConnection) {
        const address = addresses.find((a) => a.hash === authorizedConnection.address)
        if (!address) return
        const connectedAddressPayload = await getConnectedAddressPayload(network, address, data.host)
        handleApproveDappConnection(connectedAddressPayload, messageId)
      } else if (
        // Wrong network
        data.networkId !== undefined &&
        currentlyOnlineNetworkId !== getNetworkIdFromNetworkName(data.networkId as NetworkName)
      ) {
        dispatch(
          openModal({
            name: 'NetworkSwitchModal',
            props: {
              ...data,
              dAppName,
              onReject: () => handleRejectDappConnection(data.host, messageId)
            }
          })
        )
      } else {
        // TODO: handle keyType and groupless addresses
        const addressesInGroup = data.group !== undefined ? addresses.filter((a) => a.group === data.group) : addresses

        if (addressesInGroup.length === 0) {
          // Show new address modal (won't be needed after integrating groupless addresses since 1 groupless address will be enough)
          dispatch(
            openModal({
              name: 'NewAddressModal',
              props: { ...data, dAppName, onReject: () => handleRejectDappConnection(data.host, messageId) }
            })
          )
        } else if (addressesInGroup.length === 1) {
          // Select address automatically
          const connectedAddressPayload = await getConnectedAddressPayload(network, addressesInGroup[0], data.host)
          handleApproveDappConnection(connectedAddressPayload, messageId)
        } else {
          dispatch(
            openModal({
              name: 'ConnectDappModal',
              props: {
                ...data,
                dAppName,
                onReject: () => handleRejectDappConnection(data.host, messageId),
                onApprove: (data) => handleApproveDappConnection(data, messageId)
              }
            })
          )
        }
      }
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
    async (data: ExecuteTransactionMessageData, messageId: string) => {
      const actionHash = messageId
      replyToDapp({ type: 'ALPH_EXECUTE_TRANSACTION_RES', data: { actionHash } }, messageId)

      try {
        if (data.txParams.length === 0) {
          replyToDapp(
            { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'No transactions to execute' } },
            messageId
          )
        }

        if (data.txParams.length === 1) {
          const transaction = data.txParams[0]

          switch (transaction.type) {
            // TODO: DRY
            case 'TRANSFER': {
              const { txParamsSingleDestination, buildTransactionTxResult } =
                await processSignTransferTxParamsAndBuildTx(transaction.params)

              dispatch(
                openModal({
                  name: 'SignTransferTxModal',
                  props: {
                    dAppUrl: transaction.params.host ?? dAppUrl,
                    dAppIcon: data.icon,
                    txParams: txParamsSingleDestination,
                    unsignedData: buildTransactionTxResult,
                    origin: 'in-app-browser',
                    onError: (message) => {
                      replyToDapp({ type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: message } }, messageId)
                    },
                    onReject: () =>
                      replyToDapp(
                        { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'User rejected' } },
                        messageId
                      ),
                    onSuccess: (result) =>
                      replyToDapp(
                        {
                          type: 'ALPH_TRANSACTION_SUBMITTED',
                          data: {
                            result: [
                              {
                                type: transaction.type,
                                result
                              }
                            ],
                            actionHash
                          }
                        },
                        messageId
                      )
                  }
                })
              )

              break
            }

            case 'EXECUTE_SCRIPT': {
              const { txParamsWithAmounts, buildCallContractTxResult } =
                await processSignExecuteScriptTxParamsAndBuildTx(transaction.params)

              // TODO: DRY
              dispatch(
                openModal({
                  name: 'SignExecuteScriptTxModal',
                  props: {
                    dAppUrl: transaction.params.host ?? dAppUrl,
                    dAppIcon: data.icon,
                    txParams: txParamsWithAmounts,
                    unsignedData: buildCallContractTxResult,
                    origin: 'in-app-browser',
                    onError: (message) => {
                      replyToDapp({ type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: message } }, messageId)
                    },
                    onReject: () =>
                      replyToDapp(
                        { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'User rejected' } },
                        messageId
                      ),
                    onSuccess: (result) =>
                      replyToDapp(
                        {
                          type: 'ALPH_TRANSACTION_SUBMITTED',
                          data: {
                            result: [
                              {
                                type: transaction.type,
                                result
                              }
                            ],
                            actionHash
                          }
                        },
                        messageId
                      )
                  }
                })
              )

              break
            }
            case 'DEPLOY_CONTRACT': {
              dispatch(activateAppLoading('Loading'))
              const buildDeployContractTxResult = await buildDeployContractTransaction(transaction.params)
              dispatch(deactivateAppLoading())

              // TODO: DRY with SignExecuteScriptTxModal?
              dispatch(
                openModal({
                  name: 'SignDeployContractTxModal',
                  props: {
                    dAppUrl: transaction.params.host ?? dAppUrl,
                    dAppIcon: data.icon,
                    txParams: transaction.params,
                    unsignedData: buildDeployContractTxResult,
                    origin: 'in-app-browser',
                    onError: (message) => {
                      replyToDapp({ type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: message } }, messageId)
                    },
                    onReject: () =>
                      replyToDapp(
                        { type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: 'User rejected' } },
                        messageId
                      ),
                    onSuccess: (result) =>
                      replyToDapp(
                        {
                          type: 'ALPH_TRANSACTION_SUBMITTED',
                          data: {
                            result: [
                              {
                                type: transaction.type,
                                result
                              }
                            ],
                            actionHash
                          }
                        },
                        messageId
                      )
                  }
                })
              )
              break
            }
          }

          // TODO: Process like on WC by:
          // 1. building the transaction
          // 2. showing modal identical to WalletConnectSessionRequestModal for signing and submitting the transaction
          // I should split the WalletConnectSessionRequestModal in 2 different modals:
          // 1. signing transaction (includes 4: transfer, deploy, execute, sign and submit unsigned tx)
          // 2. signing message, sign unsigned tx

          // const { signature } = await executeTransactionAction(
          //   transaction,
          //   transaction.signature,
          //   background,
          //   transaction.params.networkId,
          // )

          // transactionWatcher.refresh()

          // results = [
          //   {
          //     type: transaction.type,
          //     result: {
          //       ...transaction.result,
          //       signature
          //     }
          //   }
          // ] as TransactionResult[]
        } else {
          // TODO:
          throw Error('Chained txs not supported yet')
        }
        // ALPH_TRANSACTION_SUBMITTED with TransactionResult[]
        // or
        // ALPH_TRANSACTION_FAILED
      } catch (error) {
        dispatch(deactivateAppLoading())
        const errorMessage = `${error}`
        replyToDapp({ type: 'ALPH_TRANSACTION_FAILED', data: { actionHash, error: errorMessage } }, messageId)
        showToast({
          text1: errorMessage,
          type: 'error'
        })
      }
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
    }
  }, [
    currentlyOnlineNetworkId,
    dAppMessage,
    handleConnectDapp,
    handleExecuteTransaction,
    handleIsDappPreauthorized,
    handleRejectDappConnection,
    handleRemovePreAuthorization
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
