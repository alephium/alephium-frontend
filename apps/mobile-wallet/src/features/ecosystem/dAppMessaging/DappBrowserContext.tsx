import { getNetworkIdFromNetworkName, NetworkName } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId, useUnsortedAddresses } from '@alephium/shared-react'
import { ConnectDappMessageData, RequestOptions } from '@alephium/wallet-dapp-provider'
import { createContext, ReactNode, RefObject, useCallback, useContext, useEffect, useRef } from 'react'
import WebView from 'react-native-webview'

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
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

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

  const handleIsDappPreauthorized = useCallback(
    (data: RequestOptions, messageId: number) => {
      const isPreauthorized = isConnectionAuthorized(data)
      console.log('✈️ Replying with ALPH_IS_PREAUTHORIZED_RES:', isPreauthorized)
      webViewRef.current?.postMessage(JSON.stringify({ type: 'ALPH_IS_PREAUTHORIZED_RES', data: isPreauthorized }))
      dispatch(respondedToDappMessage(messageId))
    },
    [dispatch]
  )

  const handleRejectDappConnection = useCallback(
    (messageId: number) => {
      console.log('✈️ Replying with ALPH_REJECT_PREAUTHORIZATION')
      webViewRef.current?.postMessage(JSON.stringify({ type: 'ALPH_REJECT_PREAUTHORIZATION' }))
      dispatch(respondedToDappMessage(messageId))
    },
    [dispatch]
  )

  const handleRemovePreAuthorization = useCallback(
    (host: string, messageId: number) => {
      dispatch(connectionRemoved(host))
      console.log('✈️ Replying with ALPH_REMOVE_PREAUTHORIZATION_RES')
      webViewRef.current?.postMessage(JSON.stringify({ type: 'ALPH_REMOVE_PREAUTHORIZATION_RES' }))
      dispatch(respondedToDappMessage(messageId))
    },
    [dispatch]
  )

  const handleApproveDappConnection = useCallback(
    (data: ConnectedAddressPayload, messageId: number) => {
      dispatch(connectionAuthorized(data))
      console.log('✈️ Replying with ALPH_CONNECT_DAPP_RES', data)
      webViewRef.current?.postMessage(JSON.stringify({ type: 'ALPH_CONNECT_DAPP_RES', data }))
      dispatch(respondedToDappMessage(messageId))
    },
    [dispatch]
  )

  const handleConnectDapp = useCallback(
    async (data: ConnectDappMessageData, messageId: number) => {
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
              onReject: () => handleRejectDappConnection(messageId)
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
              props: { ...data, dAppName, onReject: () => handleRejectDappConnection(messageId) }
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
                onReject: () => handleRejectDappConnection(messageId),
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
        handleRejectDappConnection(dAppMessage.id)
        break
      case 'ALPH_CONNECT_DAPP':
        handleConnectDapp(dAppMessage.data, dAppMessage.id)
        break
      case 'ALPH_EXECUTE_TRANSACTION':
    }
  }, [
    currentlyOnlineNetworkId,
    dAppMessage,
    handleConnectDapp,
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
