/*
Copyright 2018 - 2024 The Alephium Authors
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

import {
  AssetAmount,
  getHumanReadableError,
  WALLETCONNECT_ERRORS,
  WalletConnectClientStatus,
  WalletConnectError
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { formatChain, isCompatibleAddressGroup, RelayMethod } from '@alephium/walletconnect-provider'
import {
  ApiRequestArguments,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignUnsignedTxParams,
  SignUnsignedTxResult
} from '@alephium/web3'
import { node } from '@alephium/web3'
import {
  CORE_STORAGE_OPTIONS,
  CORE_STORAGE_PREFIX,
  Expirer,
  HISTORY_CONTEXT,
  HISTORY_STORAGE_VERSION,
  MESSAGES_CONTEXT,
  MESSAGES_STORAGE_VERSION,
  STORE_STORAGE_VERSION
} from '@walletconnect/core'
import { KeyValueStorage } from '@walletconnect/keyvaluestorage'
import SignClient from '@walletconnect/sign-client'
import { REQUEST_CONTEXT, SESSION_CONTEXT, SIGN_CLIENT_STORAGE_PREFIX } from '@walletconnect/sign-client'
import {
  EngineTypes,
  JsonRpcRecord,
  MessageRecord,
  PendingRequestTypes,
  SessionTypes,
  SignClientTypes
} from '@walletconnect/types'
import { calcExpiry, getSdkError, mapToObj, objToMap } from '@walletconnect/utils'
import { partition } from 'lodash'
import { usePostHog } from 'posthog-js/react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import client from '@/api/client'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import SendModalCallContract from '@/modals/SendModals/CallContract'
import SendModalDeployContract from '@/modals/SendModals/DeployContract'
import SignMessageModal from '@/modals/WalletConnect/SignMessageModal'
import SignUnsignedTxModal from '@/modals/WalletConnect/SignUnsignedTxModal'
import WalletConnectSessionProposalModal from '@/modals/WalletConnect/WalletConnectSessionProposalModal'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { walletConnectPairingFailed, walletConnectProposalApprovalFailed } from '@/storage/dApps/dAppActions'
import { Address } from '@/types/addresses'
import {
  CallContractTxData,
  DappTxData,
  DeployContractTxData,
  SignMessageData,
  SignUnsignedTxData,
  TransferTxData,
  TxDataToModalType,
  TxType
} from '@/types/transactions'
import { SessionProposalEvent, SessionRequestEvent } from '@/types/walletConnect'
import { AlephiumWindow } from '@/types/window'
import { useInterval } from '@/utils/hooks'
import { getActiveWalletConnectSessions, isNetworkValid, parseSessionProposalEvent } from '@/utils/walletConnect'

const MaxRequestNumToKeep = 10

export interface WalletConnectContextProps {
  walletConnectClient?: SignClient
  pairWithDapp: (uri: string) => void
  unpairFromDapp: (pairingTopic: string) => Promise<void>
  dappTxData?: DappTxData
  activeSessions: SessionTypes.Struct[]
  dAppUrlToConnectTo?: string
  reset: () => Promise<void>
  sessionRequestEvent?: SessionRequestEvent
}

const initialContext: WalletConnectContextProps = {
  walletConnectClient: undefined,
  pairWithDapp: () => null,
  unpairFromDapp: () => Promise.resolve(),
  dappTxData: undefined,
  activeSessions: [],
  dAppUrlToConnectTo: undefined,
  reset: () => Promise.resolve()
}

const WalletConnectContext = createContext<WalletConnectContextProps>(initialContext)

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

export const WalletConnectContextProvider: FC = ({ children }) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)
  const currentNetwork = useAppSelector((s) => s.network)
  const mnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const dispatch = useAppDispatch()
  const posthog = usePostHog()

  const [isSessionProposalModalOpen, setIsSessionProposalModalOpen] = useState(false)
  const [isDeployContractSendModalOpen, setIsDeployContractSendModalOpen] = useState(false)
  const [isCallScriptSendModalOpen, setIsCallScriptSendModalOpen] = useState(false)
  const [isSignUnsignedTxModalOpen, setIsSignUnsignedTxModalOpen] = useState(false)
  const [isSignMessageModalOpen, setIsSignMessageModalOpen] = useState(false)

  const [walletConnectClient, setWalletConnectClient] = useState(initialContext.walletConnectClient)
  const [activeSessions, setActiveSessions] = useState(initialContext.activeSessions)
  const [dappTxData, setDappTxData] = useState(initialContext.dappTxData)
  const [sessionRequestEvent, setSessionRequestEvent] = useState<SessionRequestEvent>()
  const [sessionProposalEvent, setSessionProposalEvent] = useState<SessionProposalEvent>()
  const [walletConnectClientStatus, setWalletConnectClientStatus] = useState<WalletConnectClientStatus>('uninitialized')
  const [walletLockedBeforeProcessingWCRequest, setWalletLockedBeforeProcessingWCRequest] = useState(false)

  const isAuthenticated = !!mnemonic

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
        logger: import.meta.env.VITE_VERSION.includes('-rc.') ? 'debug' : undefined
      })
      console.log('✅ INITIALIZING WC CLIENT: DONE!')
      cleanHistory(client, false)

      setWalletConnectClient(client)
      setWalletConnectClientStatus('initialized')
      setActiveSessions(getActiveWalletConnectSessions(client))
    } catch (e) {
      setWalletConnectClientStatus('uninitialized')
      console.error('Could not initialize WalletConnect client', e)
      posthog.capture('Error', {
        message: `Could not initialize WalletConnect client: ${getHumanReadableError(e, '')}`
      })
    }
  }, [posthog])

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
      setDappTxData(undefined)
    },
    [walletConnectClient, cleanStorage]
  )

  const respondToWalletConnectWithSuccess = async (event: SessionRequestEvent, result: node.SignResult) =>
    await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })

  const respondToWalletConnectWithError = useCallback(
    async (event: SessionRequestEvent, error: ReturnType<typeof getSdkError>) =>
      await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', error }),
    [respondToWalletConnect]
  )

  const onSessionProposal = useCallback(async (sessionProposalEvent: SessionProposalEvent) => {
    console.log('📣 RECEIVED EVENT PROPOSAL TO CONNECT TO A DAPP!')
    console.log('👉 ARGS:', sessionProposalEvent)
    console.log('⏳ WAITING FOR PROPOSAL APPROVAL OR REJECTION')

    setSessionProposalEvent(sessionProposalEvent)
    setIsSessionProposalModalOpen(true)
  }, [])

  const onSessionRequest = useCallback(
    async (event: SessionRequestEvent) => {
      if (!walletConnectClient) return

      setSessionRequestEvent(event)

      const getSignerAddressByHash = (hash: string) => {
        const address = addresses.find((a) => a.hash === hash)
        if (!address) throw new Error(`Unknown signer address: ${hash}`)

        return address
      }

      const setTxDataAndOpenModal = ({ txData, modalType }: TxDataToModalType) => {
        setDappTxData(txData)

        if (modalType === TxType.DEPLOY_CONTRACT) {
          setIsDeployContractSendModalOpen(true)
        } else if (modalType === TxType.SCRIPT) {
          setIsCallScriptSendModalOpen(true)
        } else if (modalType === TxType.SIGN_UNSIGNED_TX) {
          setIsSignUnsignedTxModalOpen(true)
        } else if (modalType === TxType.SIGN_MESSAGE) {
          setIsSignMessageModalOpen(true)
        }
      }

      const {
        params: { request }
      } = event

      console.log('📣 RECEIVED EVENT TO PROCESS A SESSION REQUEST FROM THE DAPP.')
      console.log('👉 REQUESTED METHOD:', request.method)

      if (request.method.startsWith('alph_sign')) {
        electron?.app.show()
      }

      if (addresses.length === 0) {
        setWalletLockedBeforeProcessingWCRequest(true)
        return
      }

      try {
        switch (request.method as RelayMethod) {
          case 'alph_signAndSubmitTransferTx': {
            const p = request.params as SignTransferTxParams
            const dest = p.destinations[0]

            const txData: TransferTxData = {
              fromAddress: getSignerAddressByHash(p.signerAddress),
              toAddress: p.destinations[0].address,
              assetAmounts: [
                { id: ALPH.id, amount: BigInt(dest.attoAlphAmount) },
                ...(dest.tokens ? dest.tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
              ],
              gasAmount: p.gasAmount,
              gasPrice: p.gasPrice?.toString()
            }

            setTxDataAndOpenModal({ txData, modalType: TxType.TRANSFER })
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

            setTxDataAndOpenModal({ txData, modalType: TxType.DEPLOY_CONTRACT })
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

            setTxDataAndOpenModal({ txData, modalType: TxType.SCRIPT })
            break
          }
          case 'alph_signMessage': {
            const { message, messageHasher, signerAddress } = request.params as SignMessageParams
            const txData: SignMessageData = {
              fromAddress: getSignerAddressByHash(signerAddress),
              message,
              messageHasher
            }
            setTxDataAndOpenModal({ txData, modalType: TxType.SIGN_MESSAGE })

            break
          }
          case 'alph_signUnsignedTx': {
            const { unsignedTx, signerAddress } = request.params as SignUnsignedTxParams
            const txData: SignUnsignedTxData = {
              fromAddress: getSignerAddressByHash(signerAddress),
              unsignedTx
            }
            setTxDataAndOpenModal({ txData, modalType: TxType.SIGN_UNSIGNED_TX })
            break
          }
          case 'alph_requestNodeApi': {
            walletConnectClient.core.expirer.set(event.id, calcExpiry(5))
            const p = request.params as ApiRequestArguments
            const result = await client.node.request(p)

            await walletConnectClient.respond({
              topic: event.topic,
              response: { id: event.id, jsonrpc: '2.0', result }
            })
            await cleanStorage(event)
            break
          }
          case 'alph_requestExplorerApi': {
            walletConnectClient.core.expirer.set(event.id, calcExpiry(5))
            const p = request.params as ApiRequestArguments
            // TODO: Remove following code when using explorer client from web3 library
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const call = (client.explorer as any)[`${p.path}`][`${p.method}`] as (...arg0: any[]) => Promise<any>
            const result = await call(...p.params)

            await walletConnectClient.respond({
              topic: event.topic,
              response: { id: event.id, jsonrpc: '2.0', result }
            })
            await cleanStorage(event)
            break
          }
          default:
            // TODO: support all of the other SignerProvider methods
            respondToWalletConnectWithError(event, getSdkError('WC_METHOD_UNSUPPORTED'))
            throw new Error(`Method not supported: ${request.method}`)
        }
      } catch (e) {
        console.error('Error while parsing WalletConnect session request', e)
        posthog.capture('Error', { message: 'Could not parse WalletConnect session request' })
        respondToWalletConnectWithError(event, {
          message: getHumanReadableError(e, 'Error while parsing WalletConnect session request'),
          code: WALLETCONNECT_ERRORS.PARSING_SESSION_REQUEST_FAILED
        })
      }
    },
    [addresses, respondToWalletConnectWithError, posthog, walletConnectClient, cleanStorage]
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

      setSessionProposalEvent(undefined)
      setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))
    },
    [walletConnectClient]
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

  const shouldInitialize = walletConnectClientStatus !== 'initialized'
  useInterval(initializeWalletConnectClient, 3000, !shouldInitialize)

  useEffect(() => {
    if (walletLockedBeforeProcessingWCRequest && sessionRequestEvent && addresses.length > 0) {
      onSessionRequest(sessionRequestEvent)
    }
  }, [addresses.length, onSessionRequest, sessionRequestEvent, walletLockedBeforeProcessingWCRequest])

  useEffect(() => {
    if (!walletConnectClient || walletConnectClientStatus !== 'initialized') return

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
      electron?.walletConnect.resetDeepLinkUri()
    }

    const getDeepLinkAndConnect = async () => {
      const uri = await electron?.walletConnect.getDeepLinkUri()

      if (uri) {
        connectAndReset(uri)
      } else {
        electron?.walletConnect.onConnect(async (uri: string) => {
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
    walletConnectClientStatus
  ])

  const unpairFromDapp = useCallback(
    async (topic: string) => {
      if (!walletConnectClient) return

      try {
        console.log('⏳ DISCONNECTING FROM:', topic)
        await walletConnectClient.disconnect({ topic, reason: getSdkError('USER_DISCONNECTED') })
        console.log('✅ DISCONNECTING: DONE!')

        setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))

        posthog?.capture('WC: Disconnected from dApp')
      } catch (e) {
        console.error('❌ COULD NOT DISCONNECT FROM DAPP')
      }
    },
    [posthog, walletConnectClient]
  )

  const approveProposal = async (signerAddress: Address) => {
    console.log('👍 USER APPROVED PROPOSAL TO CONNECT TO THE DAPP.')
    console.log('⏳ VERIFYING USER PROVIDED DATA...')

    if (!walletConnectClient || !sessionProposalEvent) {
      console.error('❌ Could not find WalletConnect client or session proposal event')
      return
    }

    const { id, relayProtocol, requiredNamespace, requiredChains, requiredChainInfo, metadata } =
      parseSessionProposalEvent(sessionProposalEvent)

    if (requiredChains?.length !== 1) {
      dispatch(
        walletConnectProposalApprovalFailed(
          t('Too many chains in the WalletConnect proposal, expected 1, got {{ num }}', {
            num: requiredChains?.length
          })
        )
      )
      return
    }

    if (!requiredChainInfo) {
      dispatch(walletConnectProposalApprovalFailed(t('Could not find chain requirements in WalletConnect proposal')))
      return
    }

    if (!isNetworkValid(requiredChainInfo.networkId, currentNetwork.settings.networkId)) {
      dispatch(
        walletConnectProposalApprovalFailed(
          t(
            'The current network ({{ currentNetwork }}) does not match the network requested by WalletConnect ({{ walletConnectNetwork }})',
            {
              currentNetwork: currentNetwork.name,
              walletConnectNetwork: requiredChainInfo.networkId
            }
          )
        )
      )
      return
    }

    if (!isCompatibleAddressGroup(signerAddress.group, requiredChainInfo.addressGroup)) {
      dispatch(
        walletConnectProposalApprovalFailed(
          t(
            'The group of the selected address ({{ addressGroup }}) does not match the group required by WalletConnect ({{ walletConnectGroup }})',
            {
              addressGroup: signerAddress.group,
              walletConnectGroup: requiredChainInfo.addressGroup
            }
          )
        )
      )
      return
    }

    const namespaces: SessionTypes.Namespaces = {
      alephium: {
        methods: requiredNamespace.methods,
        events: requiredNamespace.events,
        accounts: [
          `${formatChain(requiredChainInfo.networkId, requiredChainInfo.addressGroup)}:${
            signerAddress.publicKey
          }/default`
        ]
      }
    }

    try {
      console.log('⏳ APPROVING PROPOSAL...')

      const existingSession = activeSessions.find((session) => session.peer.metadata.url === metadata.url)

      if (existingSession) {
        await walletConnectClient.disconnect({ topic: existingSession.topic, reason: getSdkError('USER_DISCONNECTED') })
      }

      const { topic, acknowledged } = await walletConnectClient.approve({ id, relayProtocol, namespaces })
      console.log('👉 APPROVAL TOPIC RECEIVED:', topic)
      console.log('✅ APPROVING: DONE!')

      console.log('⏳ WAITING FOR DAPP ACKNOWLEDGEMENT...')
      const res = await acknowledged()
      console.log('👉 DID DAPP ACTUALLY ACKNOWLEDGE?', res.acknowledged)

      setSessionProposalEvent(undefined)
      setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))

      posthog.capture('Approved WalletConnect connection')

      electron?.app.hide()
    } catch (e) {
      console.error('❌ WC: Error while approving and acknowledging', e)
    } finally {
      setIsSessionProposalModalOpen(false)
    }
  }

  const rejectProposal = async () => {
    if (!walletConnectClient || sessionProposalEvent === undefined) return

    try {
      console.log('👎 REJECTING SESSION PROPOSAL:', sessionProposalEvent.id)
      await walletConnectClient.reject({ id: sessionProposalEvent.id, reason: getSdkError('USER_REJECTED') })
      console.log('✅ REJECTING: DONE!')

      setSessionProposalEvent(undefined)

      posthog.capture('Rejected WalletConnect connection by clicking "Reject"')

      electron?.app.hide()
    } catch (e) {
      console.error('❌ WC: Error while approving and acknowledging', e)
    } finally {
      setIsSessionProposalModalOpen(false)
    }
  }

  const handleTransactionBuildFail = async (errorMessage: string) => {
    if (sessionRequestEvent)
      await respondToWalletConnectWithError(sessionRequestEvent, {
        message: errorMessage,
        code: WALLETCONNECT_ERRORS.TRANSACTION_BUILD_FAILED
      })
  }

  const handleSessionRequestModalClose = async () => {
    if (sessionRequestEvent)
      await respondToWalletConnectWithError(sessionRequestEvent, getSdkError('USER_REJECTED_EVENTS'))
  }

  const handleSendSuccess = async (result: node.SignResult) => {
    if (sessionRequestEvent) await respondToWalletConnectWithSuccess(sessionRequestEvent, result)
  }

  const handleSendFail = async (errorMessage: string) => {
    if (sessionRequestEvent)
      await respondToWalletConnectWithError(sessionRequestEvent, {
        message: errorMessage,
        code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
      })
  }

  const handleSignSuccess = async (result: SignUnsignedTxResult | SignMessageResult) => {
    if (sessionRequestEvent) await respondToWalletConnectWithSuccess(sessionRequestEvent, result)

    electron?.app.hide()
  }

  const handleSignFail = async (error: WalletConnectError) => {
    if (sessionRequestEvent) await respondToWalletConnectWithError(sessionRequestEvent, error)
  }

  const handleSignReject = async () => {
    if (sessionRequestEvent) await respondToWalletConnectWithError(sessionRequestEvent, getSdkError('USER_REJECTED'))

    electron?.app.hide()
  }

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

  return (
    <WalletConnectContext.Provider
      value={{
        unpairFromDapp,
        walletConnectClient,
        dappTxData,
        pairWithDapp,
        activeSessions,
        dAppUrlToConnectTo: sessionProposalEvent?.params.proposer.metadata.url,
        reset,
        sessionRequestEvent
      }}
    >
      {children}

      <ModalPortal>
        {isAuthenticated && (
          <>
            {!!sessionProposalEvent && isSessionProposalModalOpen && (
              <WalletConnectSessionProposalModal
                approveProposal={approveProposal}
                rejectProposal={rejectProposal}
                proposalEvent={sessionProposalEvent}
                onClose={() => setIsSessionProposalModalOpen(false)}
              />
            )}
            {isDeployContractSendModalOpen && dappTxData && (
              <SendModalDeployContract
                initialTxData={dappTxData}
                txData={dappTxData as DeployContractTxData}
                onClose={() => {
                  handleSessionRequestModalClose()
                  setIsDeployContractSendModalOpen(false)
                }}
                onTransactionBuildFail={(errorMessage) => {
                  handleTransactionBuildFail(errorMessage)
                  setIsDeployContractSendModalOpen(false)
                }}
                onSendSuccess={handleSendSuccess}
                onSendFail={handleSendFail}
              />
            )}
            {isCallScriptSendModalOpen && dappTxData && (
              <SendModalCallContract
                initialStep="info-check"
                initialTxData={dappTxData}
                txData={dappTxData as CallContractTxData}
                onClose={() => {
                  handleSessionRequestModalClose()
                  setIsCallScriptSendModalOpen(false)
                }}
                onTransactionBuildFail={(errorMessage) => {
                  handleTransactionBuildFail(errorMessage)
                  setIsCallScriptSendModalOpen(false)
                }}
                onSendSuccess={handleSendSuccess}
                onSendFail={handleSendFail}
              />
            )}
            {isSignUnsignedTxModalOpen && dappTxData && (
              <SignUnsignedTxModal
                txData={dappTxData as SignUnsignedTxData}
                onClose={() => {
                  handleSessionRequestModalClose()
                  setIsSignUnsignedTxModalOpen(false)
                }}
                onSignSuccess={handleSignSuccess}
                onSignFail={handleSignFail}
                onSignReject={handleSignReject}
              />
            )}
            {isSignMessageModalOpen && dappTxData && (
              <SignMessageModal
                txData={dappTxData as SignMessageData}
                onClose={() => {
                  handleSessionRequestModalClose()
                  setIsSignMessageModalOpen(false)
                }}
                onSignSuccess={handleSignSuccess}
                onSignFail={handleSignFail}
                onSignReject={handleSignReject}
              />
            )}
          </>
        )}
      </ModalPortal>
    </WalletConnectContext.Provider>
  )
}

function getWCStorageKey(prefix: string, version: string, name: string): string {
  return prefix + version + '//' + name
}

function isApiRequest(record: JsonRpcRecord): boolean {
  const request = record.request
  if (request.method !== 'wc_sessionRequest') {
    return false
  }
  const alphRequestMethod = request.params?.request?.method
  return alphRequestMethod === 'alph_requestNodeApi' || alphRequestMethod === 'alph_requestExplorerApi'
}

async function getSessionTopics(storage: KeyValueStorage): Promise<string[]> {
  const sessionKey = getWCStorageKey(SIGN_CLIENT_STORAGE_PREFIX, STORE_STORAGE_VERSION, SESSION_CONTEXT)
  const sessions = await storage.getItem<SessionTypes.Struct[]>(sessionKey)
  return sessions === undefined ? [] : sessions.map((session) => session.topic)
}

// clean the `history` and `messages` storage before `SignClient` init
async function cleanBeforeInit() {
  console.log('Clean storage before SignClient init')
  const storage = new KeyValueStorage({ ...CORE_STORAGE_OPTIONS })
  const historyStorageKey = getWCStorageKey(CORE_STORAGE_PREFIX, HISTORY_STORAGE_VERSION, HISTORY_CONTEXT)
  // history records are sorted by expiry
  const historyRecords = await storage.getItem<JsonRpcRecord[]>(historyStorageKey)
  if (historyRecords !== undefined) {
    const remainRecords: JsonRpcRecord[] = []
    let alphSignRequestNum = 0
    let unresponsiveRequestNum = 0
    const now = Date.now()
    for (const record of historyRecords.reverse()) {
      const msToExpiry = (record.expiry || 0) * 1000 - now
      if (msToExpiry <= 0) continue
      const requestMethod = record.request.params?.request?.method as string | undefined
      if (requestMethod?.startsWith('alph_sign') && alphSignRequestNum < MaxRequestNumToKeep) {
        remainRecords.push(record)
        alphSignRequestNum += 1
      } else if (
        record.response === undefined &&
        !isApiRequest(record) &&
        unresponsiveRequestNum < MaxRequestNumToKeep
      ) {
        remainRecords.push(record)
        unresponsiveRequestNum += 1
      }
    }
    await storage.setItem<JsonRpcRecord[]>(historyStorageKey, remainRecords.reverse())
  }

  await cleanPendingRequest(storage)

  const topics = await getSessionTopics(storage)
  if (topics.length > 0) {
    const messageStorageKey = getWCStorageKey(CORE_STORAGE_PREFIX, MESSAGES_STORAGE_VERSION, MESSAGES_CONTEXT)
    const messages = await storage.getItem<Record<string, MessageRecord>>(messageStorageKey)
    if (messages === undefined) {
      return
    }

    const messagesMap = objToMap(messages)
    topics.forEach((topic) => messagesMap.delete(topic))
    await storage.setItem<Record<string, MessageRecord>>(messageStorageKey, mapToObj(messagesMap))
    console.log(`Clean topics from messages storage: ${topics.join(',')}`)
  }
}

function cleanHistory(client: SignClient, checkResponse: boolean) {
  try {
    const records = client.core.history.records
    for (const [id, record] of records) {
      if (checkResponse && record.response === undefined) {
        continue
      }
      if (isApiRequest(record)) {
        client.core.history.delete(record.topic, id)
      }
    }
  } catch (error) {
    console.error(`Failed to clean history, error: ${error}`)
  }
}

async function cleanMessages(client: SignClient, topic: string) {
  try {
    await client.core.relayer.messages.del(topic)
  } catch (error) {
    console.error(`Failed to clean messages, error: ${error}, topic: ${topic}`)
  }
}

async function cleanPendingRequest(storage: KeyValueStorage) {
  const pendingRequestStorageKey = getWCStorageKey(SIGN_CLIENT_STORAGE_PREFIX, STORE_STORAGE_VERSION, REQUEST_CONTEXT)
  const pendingRequests = await storage.getItem<PendingRequestTypes.Struct[]>(pendingRequestStorageKey)
  if (pendingRequests !== undefined) {
    const remainPendingRequests = pendingRequests.filter((request) => {
      const method = request.params.request.method
      return method !== 'alph_requestNodeApi' && method !== 'alph_requestExplorerApi'
    })
    await storage.setItem<PendingRequestTypes.Struct[]>(pendingRequestStorageKey, remainPendingRequests)
  }
}

async function clearWCStorage() {
  try {
    const storage = new KeyValueStorage({ ...CORE_STORAGE_OPTIONS })
    const keys = await storage.getKeys()
    for (const key of keys) {
      await storage.removeItem(key)
    }
  } catch (error) {
    console.error(`Failed to clear walletconnect storage, error: ${error}`)
  }
}

export const useWalletConnectContext = () => useContext(WalletConnectContext)
