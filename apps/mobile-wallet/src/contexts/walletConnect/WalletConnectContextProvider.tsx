import { getHumanReadableError, isDappMessageHasherAllowed, WALLETCONNECT_ERRORS } from '@alephium/shared'
import { throttledClient } from '@alephium/shared/api'
import {
  selectAllAddressByType,
  walletConnectClientInitialized,
  walletConnectClientInitializeFailed,
  walletConnectClientInitializing,
  walletConnectClientMaxRetriesReached
} from '@alephium/shared/store'
import { getChainedTxPropsFromSignChainedTxParams } from '@alephium/shared/transactions'
import { SessionProposalEvent, SessionRequestEvent, TransactionParams } from '@alephium/shared/types'
import { isInsufficientFundsError, parseSessionProposalEvent } from '@alephium/shared/utils'
import {
  getRefillMissingBalancesChainedTxParams,
  nodeTransactionDecodeUnsignedTxQuery,
  queryClient,
  useInterval,
  useIsNodeOnline,
  useNetworkId
} from '@alephium/shared-react'
import {
  ApiRequestArguments,
  SignChainedTxParams,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignMessageParams,
  SignTransferTxParams,
  SignUnsignedTxParams
} from '@alephium/web3'
import { useURL } from 'expo-linking'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InteractionManager } from 'react-native'

import { sendAnalytics } from '~/analytics'
import { WalletConnectContext, WalletConnectContextValue } from '~/contexts/walletConnect/WalletConnectContext'
import type {
  EngineTypes,
  ErrorResponse,
  RelayMethod,
  SessionTypes,
  SignClientTypes
} from '~/contexts/walletConnect/walletConnectService'
import { getChainedTxSignersPublicKeys } from '~/features/ecosystem/dAppMessaging/dAppMessagingUtils'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey } from '~/persistent-storage/addressKeys'
import { showExceptionToast, showToast, ToastDuration } from '~/utils/layout'

const MAX_WALLETCONNECT_RETRIES = 5

export const WalletConnectContextProvider = ({ children }: { children: ReactNode }) => {
  const isWalletUnlocked = useAppSelector((s) => s.wallet.isUnlocked)
  const walletId = useAppSelector((s) => s.wallet.id)
  const url = useURL()
  const wcDeepLink = useRef<string>('')
  const dispatch = useAppDispatch()
  const walletConnectClientStatus = useAppSelector((s) => s.clients.walletConnect.status)
  const { t } = useTranslation()
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()
  const { addressesWithGroup } = useAppSelector(selectAllAddressByType)

  const [walletConnectClient, setWalletConnectClient] = useState<WalletConnectContextValue['walletConnectClient']>()
  const [activeSessions, setActiveSessions] = useState<SessionTypes.Struct[]>([])
  const [walletConnectClientInitializationAttempts, setWalletConnectClientInitializationAttempts] = useState(0)

  const isWalletConnectClientReady = walletConnectClient && walletConnectClientStatus === 'initialized'

  const refreshActiveSessions = useCallback(() => {
    if (walletConnectClient) setActiveSessions(Object.values(walletConnectClient.getActiveSessions()))
  }, [walletConnectClient])

  // Since WalletConnect doesn't give us an event to listen to when a session gets dropped, we implement a polling
  // mechamism.
  useInterval(
    async () => {
      if (
        walletConnectClient &&
        Object.keys(walletConnectClient.getActiveSessions()).length !== activeSessions.length
      ) {
        const droppedSessions = activeSessions.filter(
          (session) => !Object.keys(walletConnectClient.getActiveSessions()).includes(session.topic)
        )

        // Inform the dApp that the session has been dropped.
        const WCService = await import('~/contexts/walletConnect/walletConnectService')
        droppedSessions.forEach((session) => {
          walletConnectClient.disconnectSession({
            topic: session.topic,
            reason: WCService.getSdkError('SESSION_SETTLEMENT_FAILED') // There's no error called "WC_SUCKS", so using the next best thing
          })
          showToast({
            text1: t('WalletConnect connection unexpectedly dropped.'),
            text2: t('Please, refresh {{ dAppUrl }}.', { dAppUrl: session.peer.metadata.url }),
            type: 'error',
            visibilityTime: ToastDuration.LONG
          })
        })

        // Update the list of active sessions.
        refreshActiveSessions()
      }
    },
    2000,
    !walletConnectClient || activeSessions.length === 0
  )

  const initializeWalletConnectClient = useCallback(async () => {
    dispatch(walletConnectClientInitializing())
    setWalletConnectClientInitializationAttempts((prevAttempts) => prevAttempts + 1)

    try {
      const WCService = await import('~/contexts/walletConnect/walletConnectService')
      const client = await WCService.initWalletConnectClient()

      console.log('✅ INITIALIZING WC CLIENT: DONE!')

      if (client) {
        setWalletConnectClient(client)
        dispatch(walletConnectClientInitialized())
        setActiveSessions(Object.values(client.getActiveSessions()))
      }
    } catch (error) {
      dispatch(walletConnectClientInitializeFailed(getHumanReadableError(error, '')))
      sendAnalytics({
        type: 'error',
        error,
        message: `Could not initialize WalletConnect client on attempt ${
          walletConnectClientInitializationAttempts + 1
        } (IWalletKit.init failed)`
      })
    }
  }, [dispatch, walletConnectClientInitializationAttempts])

  useEffect(() => {
    if (walletConnectClientStatus === 'initialized' && !walletConnectClient) {
      dispatch(walletConnectClientInitializeFailed(t('Lost connection to WalletConnect')))
    }
  }, [dispatch, t, walletConnectClient, walletConnectClientStatus])

  const shouldInitializeImmediately =
    walletConnectClientInitializationAttempts === 0 &&
    (walletConnectClientStatus === 'uninitialized' || walletConnectClientStatus === 'initialization-failed')

  useEffect(() => {
    if (!shouldInitializeImmediately) return

    const task = InteractionManager.runAfterInteractions(() => {
      initializeWalletConnectClient()
    })

    return () => task.cancel()
  }, [initializeWalletConnectClient, shouldInitializeImmediately])

  const shouldRetryInitializationAfterWaiting =
    walletConnectClientStatus === 'uninitialized' &&
    walletConnectClientInitializationAttempts > 0 &&
    walletConnectClientInitializationAttempts < MAX_WALLETCONNECT_RETRIES
  useInterval(initializeWalletConnectClient, 3000, !shouldRetryInitializationAfterWaiting)

  useEffect(() => {
    if (
      walletConnectClientInitializationAttempts === MAX_WALLETCONNECT_RETRIES &&
      walletConnectClientStatus === 'uninitialized'
    )
      dispatch(walletConnectClientMaxRetriesReached())
  }, [dispatch, walletConnectClientInitializationAttempts, walletConnectClientStatus])

  const cleanStorage = useCallback(
    async (event: SessionRequestEvent) => {
      if (!walletConnectClient) return
      const WCService = await import('~/contexts/walletConnect/walletConnectService')
      if (event.params.request.method.startsWith('alph_request')) {
        WCService.cleanHistory(walletConnectClient, true)
      }
      await WCService.cleanMessages(walletConnectClient, event.topic)
    },
    [walletConnectClient]
  )

  const respondToWalletConnect = useCallback(
    async (event: SessionRequestEvent, response: EngineTypes.RespondParams['response']) => {
      if (!walletConnectClient) return

      console.log('⏳ RESPONDING TO WC WITH:', { topic: event.topic, response })
      await walletConnectClient.respondSessionRequest({ topic: event.topic, response })
      console.log('✅ RESPONDING: DONE!')
      await cleanStorage(event)
    },
    [walletConnectClient, cleanStorage]
  )

  const respondToWalletConnectWithError = useCallback(
    async (event: SessionRequestEvent, error: ErrorResponse) =>
      await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', error }),
    [respondToWalletConnect]
  )

  const handleApiResponse = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (requestEvent: SignClientTypes.EventArguments['session_request'], result: any) => {
      if (!walletConnectClient) return

      try {
        if (walletConnectClient.getActiveSessions()[requestEvent.topic]) {
          await respondToWalletConnect(requestEvent, { id: requestEvent.id, jsonrpc: '2.0', result })
        } else {
          const WCService = await import('~/contexts/walletConnect/walletConnectService')
          await respondToWalletConnectWithError(requestEvent, WCService.getSdkError('USER_DISCONNECTED'))
        }
      } catch (e: unknown) {
        if (getHumanReadableError(e, '').includes('No matching key')) {
          console.log(
            'WalletConnect threw an exception because it tried to process a response to a session that is not valid because the user has already disconnected.'
          )
        }
      }
    },
    [respondToWalletConnect, respondToWalletConnectWithError, walletConnectClient]
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

  const onProposalExpire = useCallback((args: SignClientTypes.EventArguments['proposal_expire']) => {
    console.log('📣 RECEIVED EVENT TO EXPIRE PROPOSAL')
    console.log('👉 ARGS:', args)
  }, [])

  const unpairFromDapp = useCallback(
    async (topic: string) => {
      if (!walletConnectClient) return

      try {
        dispatch(activateAppLoading(t('Disconnecting')))

        console.log('⏳ DISCONNECTING FROM:', topic)

        if (walletConnectClient.getActiveSessions()[topic]) {
          const WCService = await import('~/contexts/walletConnect/walletConnectService')
          await walletConnectClient.disconnectSession({ topic, reason: WCService.getSdkError('USER_DISCONNECTED') })
        }

        console.log('✅ DISCONNECTING: DONE!')

        sendAnalytics({ event: 'WC: Disconnected from dApp' })
      } catch (e) {
        console.error('❌ COULD NOT DISCONNECT FROM DAPP', e)
      } finally {
        refreshActiveSessions()
        dispatch(deactivateAppLoading())
      }
    },
    [dispatch, refreshActiveSessions, t, walletConnectClient]
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
          const message = 'The proposal does not include a list of required chains'

          console.error(`❌ ${message}`)
          return showToast({
            text1: t('Could not approve'),
            text2: t(message),
            type: 'error',
            autoHide: false
          })
        }

        if (requiredChains.length !== 1) {
          console.error(
            `❌ Expected exactly 1 required chain in the WalletConnect proposal, got ${requiredChains.length}`
          )
          return showToast({
            text1: t('Could not approve'),
            text2: t('Expected exactly 1 required chain in the WalletConnect proposal, got {{ numberOfChains }}', {
              numberOfChains: requiredChains.length
            }),
            type: 'error',
            autoHide: false
          })
        }

        if (!requiredChainInfo) {
          console.error('❌ Could not find chain requirements in WalletConnect proposal')
          return showToast({
            text1: t('Could not approve'),
            text2: t('Could not find chain requirements in WalletConnect proposal'),
            type: 'error',
            autoHide: false
          })
        }

        const WCService = await import('~/contexts/walletConnect/walletConnectService')
        const chain = WCService.formatChain(requiredChainInfo.networkId, requiredChainInfo.addressGroup)

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
        showToast({
          text1: t('Could not approve'),
          text2: t('There is something wrong in the received WalletConnect data.'),
          type: 'error',
          autoHide: false
        })
      }
    },
    [dispatch, t]
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
          } else {
            showToast({
              text1: t('Could not connect'),
              text2:
                t('This WalletConnect session is not valid anymore.') +
                ' ' +
                t('Try to refresh the dApp and connect again.'),
              type: 'error',
              autoHide: false
            })
          }
        } else {
          console.log('⏳ PAIRING WITH WALLETCONNECT USING URI:', uri)
          try {
            await walletConnectClient.pair({ uri })
          } catch (e) {
            await walletConnectClient.core.pairing.pair({ uri })
          } finally {
            console.log('✅ PAIRING: DONE!')
          }
        }
      } catch (e) {
        console.error('❌ COULD NOT PAIR WITH: ', uri, e)
      }
    },
    [onSessionProposal, t, walletConnectClient]
  )

  const getDappIcon = useCallback(
    (topic: string) => activeSessions.find((s) => s.topic === topic)?.peer.metadata?.icons?.[0],
    [activeSessions]
  )

  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      if (!walletConnectClient) return

      console.log('📣 RECEIVED EVENT TO PROCESS A SESSION REQUEST FROM THE DAPP.')
      console.log('👉 REQUESTED METHOD:', requestEvent.params.request.method)

      let transactionParams: TransactionParams | undefined = undefined

      try {
        try {
          switch (requestEvent.params.request.method as RelayMethod) {
            case 'alph_signAndSubmitTransferTx': {
              const txParams = requestEvent.params.request.params as SignTransferTxParams
              transactionParams = { type: 'TRANSFER', params: txParams }

              // Note: We might need to build sweep txs here by checking that the requested balances to be transfered
              // are exactly the same as the total balances of the signer address, like we do in the normal send flow.
              // That would make sense only if we have a single destination otherwise what should the sweep destination
              // address be?

              dispatch(activateAppLoading('Loading'))
              const unsignedBuiltTx = await throttledClient.txBuilder.buildTransferTx(
                txParams,
                await getAddressAsymetricKey(walletId, txParams.signerAddress, 'public')
              )
              dispatch(deactivateAppLoading())

              dispatch(
                openModal({
                  name: 'SignTransferTxModal',
                  onUserDismiss: async () => {
                    const WCService = await import('~/contexts/walletConnect/walletConnectService')
                    respondToWalletConnectWithError(requestEvent, WCService.getSdkError('USER_REJECTED'))
                  },
                  props: {
                    dAppUrl: requestEvent.verifyContext.verified.origin,
                    dAppIcon: getDappIcon(requestEvent.topic),
                    txParams,
                    unsignedData: unsignedBuiltTx,
                    origin: 'walletconnect',
                    onError: (message) => {
                      respondToWalletConnectWithError(requestEvent, {
                        message,
                        code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                      })
                    },
                    onSuccess: (result) =>
                      respondToWalletConnect(requestEvent, { id: requestEvent.id, jsonrpc: '2.0', result })
                  }
                })
              )

              break
            }
            case 'alph_signAndSubmitDeployContractTx': {
              const txParams = requestEvent.params.request.params as SignDeployContractTxParams
              transactionParams = { type: 'DEPLOY_CONTRACT', params: txParams }

              dispatch(activateAppLoading(t('Processing WalletConnect request')))
              const unsignedData = await throttledClient.txBuilder.buildDeployContractTx(
                txParams,
                await getAddressAsymetricKey(walletId, txParams.signerAddress, 'public')
              )

              dispatch(
                openModal({
                  name: 'SignDeployContractTxModal',
                  onUserDismiss: async () => {
                    const WCService = await import('~/contexts/walletConnect/walletConnectService')
                    respondToWalletConnectWithError(requestEvent, WCService.getSdkError('USER_REJECTED'))
                  },
                  props: {
                    dAppUrl: requestEvent.verifyContext.verified.origin,
                    dAppIcon: getDappIcon(requestEvent.topic),
                    txParams,
                    unsignedData,
                    origin: 'walletconnect',
                    onError: (message) => {
                      respondToWalletConnectWithError(requestEvent, {
                        message,
                        code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                      })
                    },
                    onSuccess: (result) =>
                      respondToWalletConnect(requestEvent, { id: requestEvent.id, jsonrpc: '2.0', result })
                  }
                })
              )

              break
            }
            case 'alph_signAndSubmitExecuteScriptTx': {
              const txParams = requestEvent.params.request.params as SignExecuteScriptTxParams
              transactionParams = { type: 'EXECUTE_SCRIPT', params: txParams }

              dispatch(activateAppLoading('Loading'))
              const unsignedBuiltTx = await throttledClient.txBuilder.buildExecuteScriptTx(
                txParams,
                await getAddressAsymetricKey(walletId, txParams.signerAddress, 'public')
              )

              dispatch(
                openModal({
                  name: 'SignExecuteScriptTxModal',
                  onUserDismiss: async () => {
                    const WCService = await import('~/contexts/walletConnect/walletConnectService')
                    respondToWalletConnectWithError(requestEvent, WCService.getSdkError('USER_REJECTED'))
                  },
                  props: {
                    dAppUrl: requestEvent.verifyContext.verified.origin,
                    dAppIcon: getDappIcon(requestEvent.topic),
                    txParams,
                    unsignedData: unsignedBuiltTx,
                    origin: 'walletconnect',
                    onError: (message) => {
                      respondToWalletConnectWithError(requestEvent, {
                        message,
                        code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                      })
                    },
                    onSuccess: (result) =>
                      respondToWalletConnect(requestEvent, { id: requestEvent.id, jsonrpc: '2.0', result })
                  }
                })
              )

              break
            }
            case 'alph_signMessage': {
              const signParams = requestEvent.params.request.params as SignMessageParams

              if (!isDappMessageHasherAllowed(signParams.messageHasher)) {
                respondToWalletConnectWithError(requestEvent, {
                  message: `Unsupported message hasher '${signParams.messageHasher}'. Only the 'alephium' message hasher is accepted.`,
                  code: WALLETCONNECT_ERRORS.MESSAGE_SIGN_FAILED
                })
                break
              }

              dispatch(
                openModal({
                  name: 'SignMessageTxModal',
                  onUserDismiss: async () => {
                    const WCService = await import('~/contexts/walletConnect/walletConnectService')
                    respondToWalletConnectWithError(requestEvent, WCService.getSdkError('USER_REJECTED'))
                  },
                  props: {
                    dAppUrl: requestEvent.verifyContext.verified.origin,
                    dAppIcon: getDappIcon(requestEvent.topic),
                    txParams: signParams,
                    unsignedData: signParams.message,
                    origin: 'walletconnect',
                    onError: (message) => {
                      respondToWalletConnectWithError(requestEvent, {
                        message,
                        code: WALLETCONNECT_ERRORS.MESSAGE_SIGN_FAILED
                      })
                    },
                    onSuccess: (result) =>
                      respondToWalletConnect(requestEvent, { id: requestEvent.id, jsonrpc: '2.0', result })
                  }
                })
              )

              break
            }
            case 'alph_signUnsignedTx':
            case 'alph_signAndSubmitUnsignedTx': {
              const txParams = requestEvent.params.request.params as SignUnsignedTxParams
              const submitAfterSign = requestEvent.params.request.method === 'alph_signAndSubmitUnsignedTx'

              dispatch(activateAppLoading(t('Processing WalletConnect request')))
              const decodedTx = await queryClient.fetchQuery(
                nodeTransactionDecodeUnsignedTxQuery({
                  unsignedTx: txParams.unsignedTx,
                  networkId,
                  isNodeOnline
                })
              )

              dispatch(
                openModal({
                  name: 'SignUnsignedTxModal',
                  onUserDismiss: async () => {
                    const WCService = await import('~/contexts/walletConnect/walletConnectService')
                    respondToWalletConnectWithError(requestEvent, WCService.getSdkError('USER_REJECTED'))
                  },
                  props: {
                    dAppUrl: requestEvent.verifyContext.verified.origin,
                    dAppIcon: getDappIcon(requestEvent.topic),
                    txParams,
                    unsignedData: decodedTx,
                    submitAfterSign,
                    origin: 'walletconnect',
                    onError: (message) => {
                      respondToWalletConnectWithError(requestEvent, {
                        message,
                        code: submitAfterSign
                          ? WALLETCONNECT_ERRORS.TRANSACTION_SIGN_FAILED
                          : WALLETCONNECT_ERRORS.MESSAGE_SIGN_FAILED
                      })
                    },
                    onSuccess: (result) =>
                      respondToWalletConnect(requestEvent, { id: requestEvent.id, jsonrpc: '2.0', result })
                  }
                })
              )

              break
            }
            case 'alph_signAndSubmitChainedTx': {
              const txParams = requestEvent.params.request.params as SignChainedTxParams[]

              dispatch(activateAppLoading('Loading'))
              const publicKeys = await getChainedTxSignersPublicKeys(txParams)
              const unsignedData = await throttledClient.txBuilder.buildChainedTx(txParams, publicKeys)

              dispatch(
                openModal({
                  name: 'SignChainedTxModal',
                  onUserDismiss: async () => {
                    const WCService = await import('~/contexts/walletConnect/walletConnectService')
                    respondToWalletConnectWithError(requestEvent, WCService.getSdkError('USER_REJECTED'))
                  },
                  props: {
                    props: getChainedTxPropsFromSignChainedTxParams(txParams, unsignedData),
                    txParams,
                    onSuccess: (result) =>
                      respondToWalletConnect(requestEvent, { id: requestEvent.id, jsonrpc: '2.0', result }),
                    dAppUrl: requestEvent.verifyContext.verified.origin,
                    dAppIcon: getDappIcon(requestEvent.topic),
                    origin: 'walletconnect',
                    onError: (message) => {
                      respondToWalletConnectWithError(requestEvent, {
                        message,
                        code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                      })
                    }
                  }
                })
              )

              break
            }
            case 'alph_requestNodeApi': {
              const WCService = await import('~/contexts/walletConnect/walletConnectService')
              walletConnectClient.core.expirer.set(requestEvent.id, WCService.calcExpiry(5))
              const p = requestEvent.params.request.params as ApiRequestArguments
              const result = await throttledClient.node.request(p)

              console.log('👉 WALLETCONNECT ASKED FOR THE NODE API')

              await handleApiResponse(requestEvent, result)

              break
            }
            case 'alph_requestExplorerApi': {
              const WCService = await import('~/contexts/walletConnect/walletConnectService')
              walletConnectClient.core.expirer.set(requestEvent.id, WCService.calcExpiry(5))
              const p = requestEvent.params.request.params as ApiRequestArguments
              const result = await throttledClient.explorer.request(p)

              console.log('👉 WALLETCONNECT ASKED FOR THE EXPLORER API')

              await handleApiResponse(requestEvent, result)

              break
            }
            default: {
              const WCService = await import('~/contexts/walletConnect/walletConnectService')
              respondToWalletConnectWithError(requestEvent, WCService.getSdkError('WC_METHOD_UNSUPPORTED'))
            }
          }
        } catch (e: unknown) {
          if (isInsufficientFundsError(e) && transactionParams) {
            const chainedTxParams = await getRefillMissingBalancesChainedTxParams({
              transactionParams,
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
                  onUserDismiss: async () => {
                    const WCService = await import('~/contexts/walletConnect/walletConnectService')
                    respondToWalletConnectWithError(requestEvent, WCService.getSdkError('USER_REJECTED'))
                  },
                  props: {
                    props: getChainedTxPropsFromSignChainedTxParams(chainedTxParams, unsignedData),
                    txParams: chainedTxParams,
                    onSuccess: (result) =>
                      respondToWalletConnect(requestEvent, { id: requestEvent.id, jsonrpc: '2.0', result }),
                    dAppUrl: requestEvent.verifyContext.verified.origin,
                    dAppIcon: getDappIcon(requestEvent.topic),
                    origin: 'walletconnect:insufficient-funds',
                    onError: (message) => {
                      respondToWalletConnectWithError(requestEvent, {
                        message,
                        code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                      })
                    }
                  }
                })
              )
            } else throw e
          } else throw e
        } finally {
          dispatch(deactivateAppLoading())
        }
      } catch (e) {
        if (isInsufficientFundsError(e) && transactionParams) {
          showToast({
            text1: t('Could not build transaction'),
            text2: t('Your address does not have enough balance for this transaction.'),
            type: 'error',
            autoHide: false
          })
        } else if (!['alph_requestNodeApi', 'alph_requestExplorerApi'].includes(requestEvent.params.request.method)) {
          showExceptionToast(e, t('Could not build transaction'))
          console.error(e)
        }
        respondToWalletConnectWithError(requestEvent, {
          message: getHumanReadableError(e, t('Error while parsing WalletConnect session request')),
          code: WALLETCONNECT_ERRORS.PARSING_SESSION_REQUEST_FAILED
        })
      } finally {
        dispatch(deactivateAppLoading())
      }
    },
    [
      addressesWithGroup,
      dispatch,
      getDappIcon,
      handleApiResponse,
      isNodeOnline,
      networkId,
      respondToWalletConnect,
      respondToWalletConnectWithError,
      t,
      walletConnectClient,
      walletId
    ]
  )

  useEffect(() => {
    if (!isWalletConnectClientReady) return

    console.log('👉 SUBSCRIBING TO WALLETCONNECT SESSION EVENTS.')

    walletConnectClient.on('session_proposal', onSessionProposal)
    walletConnectClient.on('session_request', onSessionRequest)
    walletConnectClient.on('session_delete', onSessionDelete)
    walletConnectClient.on('proposal_expire', onProposalExpire)

    return () => {
      walletConnectClient.off('session_proposal', onSessionProposal)
      walletConnectClient.off('session_request', onSessionRequest)
      walletConnectClient.off('session_delete', onSessionDelete)
      walletConnectClient.off('proposal_expire', onProposalExpire)
    }
  }, [
    isWalletConnectClientReady,
    onProposalExpire,
    onSessionDelete,
    onSessionProposal,
    onSessionRequest,
    walletConnectClient
  ])

  useEffect(() => {
    if (!isWalletUnlocked || !url || !url.startsWith('wc:') || wcDeepLink.current === url || !walletConnectClient)
      return

    pairWithDapp(url)

    wcDeepLink.current = url
  }, [isWalletUnlocked, pairWithDapp, url, walletConnectClient, t])

  const resetWalletConnectClientInitializationAttempts = () => {
    if (walletConnectClientInitializationAttempts === MAX_WALLETCONNECT_RETRIES)
      setWalletConnectClientInitializationAttempts(0)
  }

  const resetWalletConnectStorage = useCallback(async () => {
    if (walletConnectClient === undefined) {
      console.log('Clear walletconnect storage')
      const WCService = await import('~/contexts/walletConnect/walletConnectService')
      await WCService.clearWCStorage()
      return
    }

    try {
      console.log('Disconnect all sessions')

      dispatch(activateAppLoading(t('Disconnecting')))

      const topics = Object.keys(walletConnectClient.getActiveSessions())
      const WCService = await import('~/contexts/walletConnect/walletConnectService')
      const reason = WCService.getSdkError('USER_DISCONNECTED')

      for (const topic of topics) {
        try {
          await walletConnectClient.disconnectSession({ topic, reason })
        } catch (error) {
          console.error(`Failed to disconnect topic ${topic}, error: ${error}`)
        }
      }
      refreshActiveSessions()

      console.log('Clear walletconnect cache')
      WCService.clearWalletConnectRuntimeCache(walletConnectClient)

      console.log('Clear walletconnect storage')
      await WCService.clearWCStorage(walletConnectClient)

      showToast({
        text1: t('WalletConnect cache cleared'),
        type: 'success'
      })
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Error at resetting WalletConnect storage' })
    } finally {
      dispatch(deactivateAppLoading())
    }
  }, [dispatch, refreshActiveSessions, walletConnectClient, t])

  return (
    <WalletConnectContext.Provider
      value={{
        pairWithDapp,
        unpairFromDapp,
        walletConnectClient,
        activeSessions,
        refreshActiveSessions,
        resetWalletConnectClientInitializationAttempts,
        resetWalletConnectStorage
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  )
}
