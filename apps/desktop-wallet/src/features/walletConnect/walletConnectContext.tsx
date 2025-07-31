import {
  getActiveWalletConnectSessions,
  getHumanReadableError,
  parseSessionProposalEvent,
  SessionProposalEvent,
  SessionRequestEvent,
  WalletConnectClientStatus,
  WalletConnectError
} from '@alephium/shared'
import { useInterval } from '@alephium/shared-react'
import { formatChain } from '@alephium/walletconnect-provider'
import { node, SignMessageResult, SignUnsignedTxResult } from '@alephium/web3'
import { Expirer } from '@walletconnect/core'
import SignClient from '@walletconnect/sign-client'
import { EngineTypes, SessionTypes, SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import WalletConnectSessionRequestEventHandler from '@/features/walletConnect/WalletConnectSessionRequestEventHandler'
import {
  cleanBeforeInit,
  cleanHistory,
  cleanMessages,
  clearWCStorage
} from '@/features/walletConnect/walletConnectUtils'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { walletConnectPairingFailed, walletConnectProposalValidationFailed } from '@/storage/dApps/dAppActions'
import { selectIsWalletUnlocked } from '@/storage/wallets/walletSelectors'
import { isRcVersion } from '@/utils/app-data'

export interface WalletConnectContextProps {
  walletConnectClient?: SignClient
  pairWithDapp: (uri: string) => void
  unpairFromDapp: (pairingTopic: string) => Promise<void>
  activeSessions: SessionTypes.Struct[]
  refreshActiveSessions: () => void
  reset: () => Promise<void>
  sendUserRejectedResponse: (hideApp?: boolean) => void
  sendSuccessResponse: (
    result: node.SignResult | SignUnsignedTxResult | SignMessageResult,
    hideApp?: boolean
  ) => Promise<void>
  sendFailureResponse: (error: WalletConnectError) => void
  resetPendingDappConnectionUrl: () => void
  isAwaitingSessionRequestApproval: boolean
  respondToWalletConnect: (event: SessionRequestEvent, response: EngineTypes.RespondParams['response']) => Promise<void>
  respondToWalletConnectWithError: (
    sessionRequestEvent: SessionRequestEvent,
    error: ReturnType<typeof getSdkError>
  ) => Promise<void>
  pendingDappConnectionUrl?: string
  reinitializeWalletConnectClient: () => void
  walletConnectClientStatus: WalletConnectClientStatus
  getDappIcon: (topic: string) => string | undefined
}

const initialContext: WalletConnectContextProps = {
  pairWithDapp: () => null,
  unpairFromDapp: () => Promise.resolve(),
  activeSessions: [],
  refreshActiveSessions: () => null,
  reset: () => Promise.resolve(),
  sendUserRejectedResponse: () => null,
  sendSuccessResponse: () => Promise.resolve(),
  sendFailureResponse: () => null,
  resetPendingDappConnectionUrl: () => null,
  isAwaitingSessionRequestApproval: false,
  respondToWalletConnectWithError: () => Promise.resolve(),
  respondToWalletConnect: () => Promise.resolve(),
  reinitializeWalletConnectClient: () => null,
  walletConnectClientStatus: 'uninitialized',
  getDappIcon: () => undefined
}

const WalletConnectContext = createContext<WalletConnectContextProps>(initialContext)

export const WalletConnectContextProvider: FC = ({ children }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()
  const isWalletUnlocked = useAppSelector(selectIsWalletUnlocked)

  const [walletConnectClient, setWalletConnectClient] = useState(initialContext.walletConnectClient)
  const [activeSessions, setActiveSessions] = useState(initialContext.activeSessions)
  const [sessionRequestEvent, setSessionRequestEvent] = useState<SessionRequestEvent>()
  const [walletConnectClientStatus, setWalletConnectClientStatus] = useState<WalletConnectClientStatus>('uninitialized')
  const [pendingDappConnectionUrl, setPendingDappConnectionUrl] = useState<string>()

  const initializeWalletConnectClient = useCallback(async () => {
    try {
      console.log('CLEANING STORAGE')
      await cleanBeforeInit()

      console.log('⏳ INITIALIZING WC CLIENT...')
      setWalletConnectClientStatus('initializing')

      const client = await SignClient.init({
        projectId: '7b08748da1a3437b3fd587c5a070f11a',
        metadata: {
          name: 'Alephium desktop wallet',
          description: 'Alephium desktop wallet',
          url: 'https://github.com/alephium/alephium-frontend',
          icons: ['https://alephium.org/favicon-32x32.png']
        },
        logger: isRcVersion ? 'debug' : undefined
      })
      console.log('✅ INITIALIZING WC CLIENT: DONE!')
      cleanHistory(client, false)

      setWalletConnectClient(client)
      setWalletConnectClientStatus('initialized')
      setActiveSessions(getActiveWalletConnectSessions(client))
    } catch (error) {
      setWalletConnectClientStatus('uninitialized')
      const reason = getHumanReadableError(error, '')

      if (
        !reason.includes('No internet connection') &&
        !reason.includes('WebSocket connection failed') &&
        !reason.includes('Socket stalled')
      ) {
        sendAnalytics({ type: 'error', error, message: 'Could not initialize WalletConnect client' })
      }
    }
  }, [sendAnalytics])

  const reinitializeWalletConnectClient = useCallback(() => setWalletConnectClientStatus('uninitialized'), [])

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

  const respondToWalletConnect = useCallback(
    async (event: SessionRequestEvent, response: EngineTypes.RespondParams['response']) => {
      if (!walletConnectClient) return

      console.log('⏳ RESPONDING TO WC WITH:', { topic: event.topic, response })
      await walletConnectClient.respond({ topic: event.topic, response })
      console.log('✅ RESPONDING: DONE!')

      await cleanStorage(event)
      setSessionRequestEvent(undefined)
    },
    [cleanStorage, walletConnectClient]
  )

  const respondToWalletConnectWithSuccess = useCallback(
    async (event: SessionRequestEvent, result: node.SignResult | SignUnsignedTxResult | SignMessageResult) => {
      await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })
    },
    [respondToWalletConnect]
  )

  const respondToWalletConnectWithError = useCallback(
    async (event: SessionRequestEvent, error: ReturnType<typeof getSdkError>) => {
      await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', error })
    },
    [respondToWalletConnect]
  )

  const resetPendingDappConnectionUrl = () => setPendingDappConnectionUrl(undefined)

  const refreshActiveSessions = useCallback(() => {
    setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))
  }, [walletConnectClient])

  const sendUserRejectedResponse = useCallback(
    async (hideApp?: boolean) => {
      if (sessionRequestEvent) await respondToWalletConnectWithError(sessionRequestEvent, getSdkError('USER_REJECTED'))

      if (hideApp) window.electron?.app.hide()
    },
    [respondToWalletConnectWithError, sessionRequestEvent]
  )

  const onSessionProposal = useCallback(
    async (proposalEvent: SessionProposalEvent) => {
      console.log('📣 RECEIVED EVENT PROPOSAL TO CONNECT TO A DAPP!')
      console.log('👉 ARGS:', proposalEvent)
      console.log('⏳ WAITING FOR PROPOSAL APPROVAL OR REJECTION')

      try {
        const { requiredChains, requiredChainInfo, requiredNamespace, metadata, relayProtocol } =
          parseSessionProposalEvent(proposalEvent)

        if (!requiredChains) {
          dispatch(walletConnectProposalValidationFailed(t('The proposal does not include a list of required chains')))
          return
        }

        if (requiredChains?.length !== 1) {
          dispatch(
            walletConnectProposalValidationFailed(
              t('Too many chains in the WalletConnect proposal, expected 1, got {{ num }}', {
                num: requiredChains?.length
              })
            )
          )
          return
        }

        if (!requiredChainInfo) {
          dispatch(
            walletConnectProposalValidationFailed(t('Could not find chain requirements in WalletConnect proposal'))
          )
          return
        }

        const chain = formatChain(requiredChainInfo.networkId, requiredChainInfo.addressGroup)

        setPendingDappConnectionUrl(proposalEvent.params.proposer.metadata.url)

        dispatch(
          openModal({
            name: 'WalletConnectSessionProposalModal',
            props: {
              proposalEventId: proposalEvent.id,
              chain,
              chainInfo: requiredChainInfo,
              requiredNamespaceMethods: requiredNamespace.methods,
              requiredNamespaceEvents: requiredNamespace.events,
              metadata,
              relayProtocol
            }
          })
        )
      } catch (error) {
        dispatch(
          walletConnectProposalValidationFailed(
            getHumanReadableError(error, t('There is something wrong in the received WalletConnect data.'))
          )
        )
      }
    },
    [dispatch, t]
  )

  const sendSuccessResponse = async (
    result: node.SignResult | SignUnsignedTxResult | SignMessageResult,
    hideApp?: boolean
  ) => {
    if (sessionRequestEvent) await respondToWalletConnectWithSuccess(sessionRequestEvent, result)

    if (hideApp) window.electron?.app.hide()
  }

  const sendFailureResponse = useCallback(
    async (error: WalletConnectError) => {
      if (sessionRequestEvent) await respondToWalletConnectWithError(sessionRequestEvent, error)
    },
    [respondToWalletConnectWithError, sessionRequestEvent]
  )

  const onSessionRequest = useCallback(
    async (event: SessionRequestEvent) => {
      if (!walletConnectClient) return

      setSessionRequestEvent(event)

      const {
        params: { request }
      } = event

      console.log('📣 RECEIVED EVENT TO PROCESS A SESSION REQUEST FROM THE DAPP.')
      console.log('👉 REQUESTED METHOD:', request.method)

      if (request.method.startsWith('alph_sign')) {
        window.electron?.app.show()
      }
    },
    [walletConnectClient]
  )

  const pairWithDapp = useCallback(
    async (uri: string) => {
      if (!walletConnectClient) return

      const pairingTopic = uri.substring('wc:'.length, uri.indexOf('@'))

      try {
        const pairings = walletConnectClient.core.pairing.pairings
        const existingPairing = pairings.values.find(({ topic }) => topic === pairingTopic)

        if (existingPairing) {
          console.log('⏳ TRYING TO CONNECT WITH EXISTING PAIRING:', pairingTopic)
          if (!existingPairing.active) {
            console.log('⏳ EXISTING PAIRING IS INACTIVE, ACTIVATING IT...')
            // `activate` doesn't trigger the onSessionProposal as the `pair` does (even if we call `pair` or `connect`)
            // despite what the docs say (https://specs.walletconnect.com/2.0/specs/clients/sign/session-events#session_proposal)
            // so we manually check for pending requests in the history that match with the pairingTopic and trigger
            // onSessionProposal.
            await walletConnectClient.core.pairing.activate({ topic: existingPairing.topic })
            console.log('✅ ACTIVATING PAIRING: DONE!')
          }
          console.log('✅ CONNECTING: DONE!')

          console.log('⏳ LOOKING FOR PENDING PROPOSAL REQUEST...')
          const pendingProposal = walletConnectClient.core.history.pending.find(
            ({ topic, request }) => topic === existingPairing.topic && request.method === 'wc_sessionPropose'
          )
          if (pendingProposal) {
            console.log('👉 FOUND PENDING PROPOSAL REQUEST!')
            onSessionProposal({
              ...pendingProposal.request,
              params: {
                id: pendingProposal.request.id,
                ...pendingProposal.request.params
              }
            })
          }
        } else {
          console.log('⏳ PAIRING WITH WALLETCONNECT USING URI:', uri)
          await walletConnectClient.core.pairing.pair({ uri })
          console.log('✅ PAIRING: DONE!')
        }
      } catch (e) {
        console.error('❌ COULD NOT PAIR WITH: ', uri, e)
        const errorMessage = getHumanReadableError(e, t('Could not pair with WalletConnect'))

        if (!errorMessage.includes('Pairing already exists')) {
          dispatch(walletConnectPairingFailed(errorMessage))
        }
      }
    },
    [dispatch, onSessionProposal, t, walletConnectClient]
  )

  const onSessionDelete = useCallback(
    async (args: SignClientTypes.EventArguments['session_delete']) => {
      console.log('📣 RECEIVED EVENT TO DISCONNECT FROM THE DAPP SESSION.')
      console.log('👉 ARGS:', args)
      console.log('🧹 CLEANING UP STATE.')

      refreshActiveSessions()
    },
    [refreshActiveSessions]
  )

  const onSessionUpdate = useCallback((args: SignClientTypes.EventArguments['session_update']) => {
    console.log('📣 RECEIVED EVENT TO UPDATE SESSION')
    console.log('👉 ARGS:', args)
  }, [])

  const onSessionEvent = useCallback((args: SignClientTypes.EventArguments['session_event']) => {
    console.log('📣 RECEIVED SESSION EVENT')
    console.log('👉 ARGS:', args)
  }, [])

  const onSessionPing = useCallback((args: SignClientTypes.EventArguments['session_ping']) => {
    console.log('📣 RECEIVED EVENT TO PING SESSION')
    console.log('👉 ARGS:', args)
  }, [])

  const onSessionExpire = useCallback((args: SignClientTypes.EventArguments['session_expire']) => {
    console.log('📣 RECEIVED EVENT TO EXPIRE SESSION')
    console.log('👉 ARGS:', args)
  }, [])

  const onSessionExtend = useCallback((args: SignClientTypes.EventArguments['session_extend']) => {
    console.log('📣 RECEIVED EVENT TO EXTEND SESSION')
    console.log('👉 ARGS:', args)
  }, [])

  const onProposalExpire = useCallback((args: SignClientTypes.EventArguments['proposal_expire']) => {
    console.log('📣 RECEIVED EVENT TO EXPIRE PROPOSAL')
    console.log('👉 ARGS:', args)
  }, [])

  const shouldInitialize = walletConnectClientStatus !== 'initialized' && walletConnectClientStatus !== 'initializing'
  useInterval(initializeWalletConnectClient, 3000, !shouldInitialize)

  useEffect(() => {
    if (!walletConnectClient || shouldInitialize) return

    console.log('👉 SUBSCRIBING TO WALLETCONNECT SESSION EVENTS.')

    walletConnectClient.on('session_proposal', onSessionProposal)
    walletConnectClient.on('session_request', onSessionRequest)
    walletConnectClient.on('session_delete', onSessionDelete)
    walletConnectClient.on('session_update', onSessionUpdate)
    walletConnectClient.on('session_event', onSessionEvent)
    walletConnectClient.on('session_ping', onSessionPing)
    walletConnectClient.on('session_expire', onSessionExpire)
    walletConnectClient.on('session_extend', onSessionExtend)
    walletConnectClient.on('proposal_expire', onProposalExpire)

    const connectAndReset = async (uri: string) => {
      await pairWithDapp(uri)
      window.electron?.walletConnect.resetDeepLinkUri()
    }

    const getDeepLinkAndConnect = async () => {
      const uri = await window.electron?.walletConnect.getDeepLinkUri()

      if (uri) {
        connectAndReset(uri)
      } else {
        window.electron?.walletConnect.onConnect(async (uri: string) => {
          connectAndReset(uri)
        })
      }
    }

    getDeepLinkAndConnect()

    return () => {
      walletConnectClient.off('session_proposal', onSessionProposal)
      walletConnectClient.off('session_request', onSessionRequest)
      walletConnectClient.off('session_delete', onSessionDelete)
      walletConnectClient.off('session_update', onSessionUpdate)
      walletConnectClient.off('session_event', onSessionEvent)
      walletConnectClient.off('session_ping', onSessionPing)
      walletConnectClient.off('session_expire', onSessionExpire)
      walletConnectClient.off('session_extend', onSessionExtend)
      walletConnectClient.off('proposal_expire', onProposalExpire)
    }
  }, [
    pairWithDapp,
    onProposalExpire,
    onSessionDelete,
    onSessionEvent,
    onSessionExpire,
    onSessionExtend,
    onSessionPing,
    onSessionProposal,
    onSessionRequest,
    onSessionUpdate,
    walletConnectClient,
    walletConnectClientStatus,
    shouldInitialize
  ])

  const unpairFromDapp = useCallback(
    async (topic: string) => {
      if (!walletConnectClient) return

      try {
        console.log('⏳ DISCONNECTING FROM:', topic)
        await walletConnectClient.disconnect({ topic, reason: getSdkError('USER_DISCONNECTED') })
        console.log('✅ DISCONNECTING: DONE!')

        sendAnalytics({ event: 'WC: Disconnected from dApp' })
      } catch (e) {
        console.error('❌ COULD NOT DISCONNECT FROM DAPP')
      } finally {
        refreshActiveSessions()
      }
    },
    [refreshActiveSessions, sendAnalytics, walletConnectClient]
  )

  const reset = useCallback(async () => {
    if (walletConnectClient === undefined) {
      console.log('Clear walletconnect storage')
      await clearWCStorage()
      return
    }

    try {
      console.log('Disconnect all sessions')
      const topics = walletConnectClient.session.keys
      const reason = getSdkError('USER_DISCONNECTED')
      for (const topic of topics) {
        try {
          await walletConnectClient.disconnect({ topic, reason })
        } catch (error) {
          console.error(`Failed to disconnect topic ${topic}, error: ${error}`)
        }
      }
      setActiveSessions([])

      console.log('Clear walletconnect cache')
      walletConnectClient.proposal.map.clear()
      walletConnectClient.pendingRequest.map.clear()
      walletConnectClient.session.map.clear()
      const expirer = walletConnectClient.core.expirer as Expirer
      expirer.expirations.clear()
      walletConnectClient.core.history.records.clear()
      walletConnectClient.core.crypto.keychain.keychain.clear()
      walletConnectClient.core.relayer.messages.messages.clear()
      walletConnectClient.core.pairing.pairings.map.clear()
      walletConnectClient.core.relayer.subscriber.subscriptions.clear()

      console.log('Clear walletconnect storage')
      await clearWCStorage()
    } catch (error) {
      console.error(`Failed to reset walletconnect, error: ${error}`)
    }
  }, [walletConnectClient, setActiveSessions])

  const getDappIcon = useCallback(
    (topic: string) => activeSessions.find((s) => s.topic === topic)?.peer.metadata?.icons?.[0],
    [activeSessions]
  )

  return (
    <WalletConnectContext.Provider
      value={{
        unpairFromDapp,
        walletConnectClient,
        pairWithDapp,
        activeSessions,
        pendingDappConnectionUrl,
        resetPendingDappConnectionUrl,
        reset,
        isAwaitingSessionRequestApproval: !!sessionRequestEvent,
        sendUserRejectedResponse,
        sendSuccessResponse,
        sendFailureResponse,
        refreshActiveSessions,
        respondToWalletConnectWithError,
        respondToWalletConnect,
        reinitializeWalletConnectClient,
        walletConnectClientStatus,
        getDappIcon
      }}
    >
      {sessionRequestEvent && isWalletUnlocked && (
        <WalletConnectSessionRequestEventHandler sessionRequestEvent={sessionRequestEvent} />
      )}
      {children}
    </WalletConnectContext.Provider>
  )
}

export const useWalletConnectContext = () => useContext(WalletConnectContext)
