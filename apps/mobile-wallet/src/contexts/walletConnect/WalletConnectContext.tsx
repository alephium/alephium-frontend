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

import '@walletconnect/react-native-compat'

import {
  AddressHash,
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
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignTransferTxResult
} from '@alephium/web3'
import { SignResult } from '@alephium/web3/dist/src/api/api-alephium'
import {
  CORE_STORAGE_OPTIONS,
  CORE_STORAGE_PREFIX,
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
import { useURL } from 'expo-linking'
import { partition } from 'lodash'
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Portal } from 'react-native-portalize'

import { sendAnalytics } from '~/analytics'
import client from '~/api/client'
import {
  buildCallContractTransaction,
  buildDeployContractTransaction,
  buildTransferTransaction
} from '~/api/transactions'
import BottomModal from '~/components/layout/BottomModal'
import SpinnerModal from '~/components/SpinnerModal'
import WalletConnectSessionProposalModal from '~/contexts/walletConnect/WalletConnectSessionProposalModal'
import WalletConnectSessionRequestModal from '~/contexts/walletConnect/WalletConnectSessionRequestModal'
import { useAppSelector } from '~/hooks/redux'
import useInterval from '~/hooks/useInterval'
import { selectAddressIds } from '~/store/addressesSlice'
import { Address } from '~/types/addresses'
import { CallContractTxData, DeployContractTxData, SignMessageData, TransferTxData } from '~/types/transactions'
import { SessionProposalEvent, SessionRequestData, SessionRequestEvent } from '~/types/walletConnect'
import { showExceptionToast, showToast } from '~/utils/layout'
import { getActiveWalletConnectSessions, isNetworkValid, parseSessionProposalEvent } from '~/utils/walletConnect'

const MaxRequestNumToKeep = 10

interface WalletConnectContextValue {
  walletConnectClient?: SignClient
  pairWithDapp: (uri: string) => Promise<void>
  unpairFromDapp: (pairingTopic: string) => Promise<void>
  activeSessions: SessionTypes.Struct[]
  resetWalletConnectClientInitializationAttempts: () => void
}

const initialValues: WalletConnectContextValue = {
  walletConnectClient: undefined,
  pairWithDapp: () => Promise.resolve(),
  unpairFromDapp: () => Promise.resolve(),
  activeSessions: [],
  resetWalletConnectClientInitializationAttempts: () => null
}

const WalletConnectContext = createContext(initialValues)

const MAX_WALLETCONNECT_RETRIES = 3

export const WalletConnectContextProvider = ({ children }: { children: ReactNode }) => {
  const currentNetworkId = useAppSelector((s) => s.network.settings.networkId)
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const addressIds = useAppSelector(selectAddressIds) as AddressHash[]
  const isWalletConnectEnabled = useAppSelector((s) => s.settings.walletConnect)
  const mnemonic = useAppSelector((s) => s.wallet.mnemonic)
  const url = useURL()
  const wcDeepLink = useRef<string>()

  const [walletConnectClient, setWalletConnectClient] = useState<WalletConnectContextValue['walletConnectClient']>()
  const [activeSessions, setActiveSessions] = useState<SessionTypes.Struct[]>([])
  const [sessionProposalEvent, setSessionProposalEvent] = useState<SessionProposalEvent>()
  const [sessionRequestEvent, setSessionRequestEvent] = useState<SessionRequestEvent>()
  const [sessionRequestData, setSessionRequestData] = useState<SessionRequestData>()
  const [isSessionProposalModalOpen, setIsSessionProposalModalOpen] = useState(false)
  const [isSessionRequestModalOpen, setIsSessionRequestModalOpen] = useState(false)
  const [loading, setLoading] = useState('')
  const [walletConnectClientStatus, setWalletConnectClientStatus] = useState<WalletConnectClientStatus>('uninitialized')
  const [walletConnectClientInitializationAttempts, setWalletConnectClientInitializationAttempts] = useState(0)

  const activeSessionMetadata = activeSessions.find((s) => s.topic === sessionRequestEvent?.topic)?.peer.metadata
  const isAuthenticated = !!mnemonic

  const initializeWalletConnectClient = useCallback(async () => {
    try {
      console.log('CLEANING STORAGE')
      await cleanBeforeInit()

      console.log('⏳ INITIALIZING WC CLIENT...')
      setWalletConnectClientStatus('initializing')
      setWalletConnectClientInitializationAttempts((prevAttempts) => prevAttempts + 1)

      const client = await SignClient.init({
        projectId: '2a084aa1d7e09af2b9044a524f39afbe',
        metadata: {
          name: 'Alephium mobile wallet',
          description: 'Alephium mobile wallet',
          url: 'https://github.com/alephium/alephium-frontend',
          icons: ['https://alephium.org/favicon-32x32.png'],
          redirect: {
            native: 'alephium://'
          }
        }
      })

      console.log('✅ INITIALIZING WC CLIENT: DONE!')
      cleanHistory(client, false)

      setWalletConnectClient(client)
      setWalletConnectClientStatus('initialized')
      setActiveSessions(getActiveWalletConnectSessions(client))
    } catch (e) {
      setWalletConnectClientStatus('uninitialized')
      console.error('Could not initialize WalletConnect client', e)
      sendAnalytics('Error', {
        message: `Could not initialize WalletConnect client: ${getHumanReadableError(e, '')}`
      })
    }
  }, [])

  useEffect(() => {
    if (walletConnectClientInitializationAttempts === MAX_WALLETCONNECT_RETRIES) {
      showToast({
        text1: 'Could not connect to WalletConnect',
        text2: 'If you want to use a dApp, please quit the app and try again.',
        type: 'error'
      })
    }
  }, [walletConnectClientInitializationAttempts])

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
    },
    [walletConnectClient, cleanStorage]
  )

  const respondToWalletConnectWithSuccess = async (event: SessionRequestEvent, result: SignResult) => {
    await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })
  }

  const respondToWalletConnectWithError = useCallback(
    async (event: SessionRequestEvent, error: ReturnType<typeof getSdkError>) =>
      await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', error }),
    [respondToWalletConnect]
  )

  const handleApiResponse = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (requestEvent: SignClientTypes.EventArguments['session_request'], result: any) => {
      if (!walletConnectClient) return

      const activeSesion = walletConnectClient.session.values.find((s) => s.topic === requestEvent.topic)

      try {
        if (activeSesion) {
          await respondToWalletConnect(requestEvent, { id: requestEvent.id, jsonrpc: '2.0', result })
        } else {
          await respondToWalletConnectWithError(requestEvent, getSdkError('USER_DISCONNECTED'))
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

  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      if (!walletConnectClient) return

      console.log('📣 RECEIVED EVENT TO PROCESS A SESSION REQUEST FROM THE DAPP.')
      console.log('👉 REQUESTED METHOD:', requestEvent.params.request.method)

      try {
        switch (requestEvent.params.request.method as RelayMethod) {
          case 'alph_signAndSubmitTransferTx': {
            const { destinations, signerAddress, gasAmount, gasPrice } = requestEvent.params.request
              .params as SignTransferTxParams
            const { address: toAddress, tokens, attoAlphAmount, lockTime } = destinations[0]
            const assetAmounts = [
              { id: ALPH.id, amount: BigInt(attoAlphAmount) },
              ...(tokens ? tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
            ]

            const fromAddress = addressIds.find((address) => address === signerAddress)

            if (!fromAddress) {
              return respondToWalletConnectWithError(requestEvent, {
                message: "Signer address doesn't exist",
                code: WALLETCONNECT_ERRORS.SIGNER_ADDRESS_DOESNT_EXIST
              })
            }

            const wcTxData: TransferTxData = {
              fromAddress,
              toAddress,
              assetAmounts,
              gasAmount,
              gasPrice: gasPrice?.toString(),
              lockTime: lockTime ? new Date(lockTime) : undefined
            }

            setLoading('Responding to WalletConnect')
            console.log('⏳ BUILDING TX WITH DATA:', wcTxData)
            const buildTransactionTxResult = await buildTransferTransaction(wcTxData)
            console.log('✅ BUILDING TX: DONE!')
            setLoading('')

            setSessionRequestData({
              type: 'transfer',
              wcData: wcTxData,
              unsignedTxData: buildTransactionTxResult
            })
            setSessionRequestEvent(requestEvent)

            console.log('⏳ OPENING MODAL TO APPROVE TX...')
            setIsSessionRequestModalOpen(true)

            break
          }
          case 'alph_signAndSubmitDeployContractTx': {
            const { signerAddress, initialAttoAlphAmount, bytecode, issueTokenAmount, gasAmount, gasPrice } =
              requestEvent.params.request.params as SignDeployContractTxParams
            const initialAlphAmount: AssetAmount | undefined = initialAttoAlphAmount
              ? { id: ALPH.id, amount: BigInt(initialAttoAlphAmount) }
              : undefined

            const fromAddress = addressIds.find((address) => address === signerAddress)

            if (!fromAddress) {
              return respondToWalletConnectWithError(requestEvent, {
                message: "Signer address doesn't exist",
                code: WALLETCONNECT_ERRORS.SIGNER_ADDRESS_DOESNT_EXIST
              })
            }

            const wcTxData: DeployContractTxData = {
              fromAddress,
              bytecode,
              initialAlphAmount,
              issueTokenAmount: issueTokenAmount?.toString(),
              gasAmount,
              gasPrice: gasPrice?.toString()
            }

            setLoading('Responding to WalletConnect')
            console.log('⏳ BUILDING TX WITH DATA:', wcTxData)
            const buildDeployContractTxResult = await buildDeployContractTransaction(wcTxData)
            console.log('✅ BUILDING TX: DONE!')
            setLoading('')

            setSessionRequestData({
              type: 'deploy-contract',
              wcData: wcTxData,
              unsignedTxData: buildDeployContractTxResult
            })
            setSessionRequestEvent(requestEvent)

            console.log('⏳ OPENING MODAL TO APPROVE TX...')
            setIsSessionRequestModalOpen(true)

            break
          }
          case 'alph_signAndSubmitExecuteScriptTx': {
            const { tokens, bytecode, gasAmount, gasPrice, signerAddress, attoAlphAmount } = requestEvent.params.request
              .params as SignExecuteScriptTxParams
            let assetAmounts: AssetAmount[] = []
            let allAlphAssets: AssetAmount[] = attoAlphAmount ? [{ id: ALPH.id, amount: BigInt(attoAlphAmount) }] : []

            const fromAddress = addressIds.find((address) => address === signerAddress)

            if (!fromAddress) {
              return respondToWalletConnectWithError(requestEvent, {
                message: "Signer address doesn't exist",
                code: WALLETCONNECT_ERRORS.SIGNER_ADDRESS_DOESNT_EXIST
              })
            }

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

            const wcTxData: CallContractTxData = {
              fromAddress,
              bytecode,
              assetAmounts,
              gasAmount,
              gasPrice: gasPrice?.toString()
            }

            setLoading('Responding to WalletConnect')
            console.log('⏳ BUILDING TX WITH DATA:', wcTxData)
            const buildCallContractTxResult = await buildCallContractTransaction(wcTxData)
            console.log('✅ BUILDING TX: DONE!')
            setLoading('')

            setSessionRequestData({
              type: 'call-contract',
              wcData: wcTxData,
              unsignedTxData: buildCallContractTxResult
            })
            setSessionRequestEvent(requestEvent)

            console.log('⏳ OPENING MODAL TO APPROVE TX...')
            setIsSessionRequestModalOpen(true)

            break
          }
          case 'alph_signMessage': {
            const { message, messageHasher, signerAddress } = requestEvent.params.request.params as SignMessageParams

            const fromAddress = addressIds.find((address) => address === signerAddress)

            if (!fromAddress) {
              return respondToWalletConnectWithError(requestEvent, {
                message: "Signer address doesn't exist",
                code: WALLETCONNECT_ERRORS.SIGNER_ADDRESS_DOESNT_EXIST
              })
            }

            const signData: SignMessageData = {
              fromAddress,
              message,
              messageHasher
            }

            setSessionRequestData({
              type: 'sign-message',
              wcData: signData
            })
            setSessionRequestEvent(requestEvent)

            console.log('⏳ OPENING MODAL TO SIGN MESSAGE...')
            setIsSessionRequestModalOpen(true)

            break
          }
          case 'alph_requestNodeApi': {
            walletConnectClient.core.expirer.set(requestEvent.id, calcExpiry(5))
            const p = requestEvent.params.request.params as ApiRequestArguments
            const result = await client.node.request(p)

            console.log('👉 WALLETCONNECT ASKED FOR THE NODE API')

            await handleApiResponse(requestEvent, result)

            break
          }
          case 'alph_requestExplorerApi': {
            walletConnectClient.core.expirer.set(requestEvent.id, calcExpiry(5))
            const p = requestEvent.params.request.params as ApiRequestArguments
            const result = await client.explorer.request(p)

            console.log('👉 WALLETCONNECT ASKED FOR THE EXPLORER API')

            await handleApiResponse(requestEvent, result)

            break
          }
          default:
            // TODO: Support all of the other SignerProvider methods
            respondToWalletConnectWithError(requestEvent, getSdkError('WC_METHOD_UNSUPPORTED'))
        }
      } catch (e: unknown) {
        const error = e as { message?: string }

        setLoading('')

        if (error.message?.includes('NotEnoughApprovedBalance')) {
          showToast({
            text1: 'Could not build transaction',
            text2: 'Your address does not have enough balance for this transaction.',
            type: 'error',
            autoHide: false
          })
        } else {
          if (!['alph_requestNodeApi', 'alph_requestExplorerApi'].includes(requestEvent.params.request.method)) {
            showExceptionToast(e, 'Could not build transaction')
            sendAnalytics('Error', { message: 'Could not build transaction' })
            console.error(e)
          }
          respondToWalletConnectWithError(requestEvent, {
            message: getHumanReadableError(e, 'Error while parsing WalletConnect session request'),
            code: WALLETCONNECT_ERRORS.PARSING_SESSION_REQUEST_FAILED
          })
        }
        // TODO: Handle consolidation case
        // TODO: Handle authentication requirement
      }
    },
    // The `addresses` dependency causes re-rendering when any property of an Address changes, even though we only need
    // the `hash`, the `publicKey`, and the `privateKey`. Creating a selector that extracts those 3 doesn't help.
    // Using addressIds fixes the problem, but now the api/transactions.ts file becomes dependant on the store file.
    // TODO: Separate offline/online address data slices
    [walletConnectClient, respondToWalletConnectWithError, addressIds, handleApiResponse]
  )

  const onSessionProposal = useCallback(async (sessionProposalEvent: SessionProposalEvent) => {
    console.log('📣 RECEIVED EVENT PROPOSAL TO CONNECT TO A DAPP!')
    console.log('👉 ARGS:', sessionProposalEvent)
    console.log('⏳ WAITING FOR PROPOSAL APPROVAL OR REJECTION')

    setSessionProposalEvent(sessionProposalEvent)
    setIsSessionProposalModalOpen(true)
  }, [])

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

  const shouldInitialize =
    isWalletConnectEnabled &&
    walletConnectClientStatus !== 'initialized' &&
    walletConnectClientInitializationAttempts < MAX_WALLETCONNECT_RETRIES
  useInterval(initializeWalletConnectClient, 3000, !shouldInitialize)

  useEffect(() => {
    if (!isWalletConnectEnabled || !walletConnectClient || walletConnectClientStatus !== 'initialized') return

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
    walletConnectClientStatus,
    isWalletConnectEnabled,
    onProposalExpire,
    onSessionDelete,
    onSessionEvent,
    onSessionExpire,
    onSessionExtend,
    onSessionPing,
    onSessionProposal,
    onSessionRequest,
    onSessionUpdate,
    walletConnectClient
  ])

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
              text1: 'Could not connect',
              text2:
                'This WalletConnect session is not valid anymore. Try to refresh the dApp and connect again. Session topic: ' +
                existingPairing.topic,
              type: 'error',
              autoHide: false
            })
          }
        } else {
          console.log('⏳ PAIRING WITH WALLETCONNECT USING URI:', uri)
          await walletConnectClient.core.pairing.pair({ uri })
          console.log('✅ PAIRING: DONE!')
        }
      } catch (e) {
        console.error('❌ COULD NOT PAIR WITH: ', uri, e)
      }
    },
    [onSessionProposal, walletConnectClient]
  )

  const unpairFromDapp = useCallback(
    async (topic: string) => {
      if (!walletConnectClient) return

      try {
        setLoading('Disconnecting...')

        console.log('⏳ DISCONNECTING FROM:', topic)
        await walletConnectClient.disconnect({ topic, reason: getSdkError('USER_DISCONNECTED') })
        console.log('✅ DISCONNECTING: DONE!')

        setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))

        sendAnalytics('WC: Disconnected from dApp')
      } catch (e) {
        console.error('❌ COULD NOT DISCONNECT FROM DAPP')
      } finally {
        setLoading('')
      }
    },
    [walletConnectClient]
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
      console.error(`❌ Expected exactly 1 required chain in the WalletConnect proposal, got ${requiredChains?.length}`)
      return showToast({
        text1: 'Could not approve',
        text2: `Expected exactly 1 required chain in the WalletConnect proposal, got ${requiredChains?.length}`,
        type: 'error',
        autoHide: false
      })
    }

    if (!requiredChainInfo) {
      console.error('❌ Could not find chain requirements in WalletConnect proposal')
      return showToast({
        text1: 'Could not approve',
        text2: 'Could not find chain requirements in WalletConnect proposal',
        type: 'error',
        autoHide: false
      })
    }

    if (!isNetworkValid(requiredChainInfo.networkId, currentNetworkId)) {
      console.error(
        `❌ WalletConnect requested the ${requiredChainInfo.networkId} network, but the current network is ${currentNetworkName}.`
      )
      return showToast({
        text1: 'Could not approve',
        text2: `WalletConnect requested the ${requiredChainInfo.networkId} network, but the current network is ${currentNetworkName}.`,
        type: 'error',
        autoHide: false
      })
    }

    if (!isCompatibleAddressGroup(signerAddress.group, requiredChainInfo.addressGroup)) {
      console.error(
        `❌ The group of the selected address (${signerAddress.group}) does not match the group required by WalletConnect (${requiredChainInfo.addressGroup})`
      )
      return showToast({
        text1: 'Could not approve',
        text2: `The group of the selected address (${signerAddress.group}) does not match the group required by WalletConnect (${requiredChainInfo.addressGroup})`,
        type: 'error',
        autoHide: false
      })
    }

    console.log('✅ VERIFIED USER PROVIDED DATA!')

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
      setLoading('Approving...')
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

      sendAnalytics('WC: Approved connection')
    } catch (e) {
      console.error('❌ WC: Error while approving and acknowledging', e)
    } finally {
      setLoading('')
      setIsSessionProposalModalOpen(false)
      showToast({ text1: 'DApp request approved', text2: 'You can go back to your browser.' })
    }
  }

  const rejectProposal = async () => {
    if (!walletConnectClient || sessionProposalEvent === undefined) return

    try {
      setLoading('Rejecting...')
      console.log('👎 REJECTING SESSION PROPOSAL:', sessionProposalEvent.id)
      await walletConnectClient.reject({ id: sessionProposalEvent.id, reason: getSdkError('USER_REJECTED') })
      console.log('✅ REJECTING: DONE!')

      setSessionProposalEvent(undefined)
    } catch (e) {
      console.error('❌ WC: Error while rejecting', e)
    } finally {
      setLoading('')
      setIsSessionProposalModalOpen(false)
      showToast({ text1: 'DApp request rejected', text2: 'You can go back to your browser.' })
    }
  }

  const handleApprovePress = async (
    sendTransaction: () => Promise<
      SignExecuteScriptTxResult | SignDeployContractTxResult | SignTransferTxResult | undefined
    >
  ) => {
    if (!sessionRequestEvent) return

    setLoading('Approving...')

    try {
      const signResult = await sendTransaction()

      if (!signResult) {
        console.log('⏳ DID NOT GET A SIGNATURE RESULT, INFORMING DAPP THAT SESSION REQUEST FAILED...')
        await respondToWalletConnectWithError(sessionRequestEvent, {
          message: 'Sending transaction failed',
          code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
        })
        console.log('✅ INFORMING: DONE!')
      } else {
        console.log('⏳ INFORMING DAPP THAT SESSION REQUEST SUCCEEDED...')
        await respondToWalletConnectWithSuccess(sessionRequestEvent, signResult)
        console.log('✅ INFORMING: DONE!')
      }
    } catch (e) {
      console.error('❌ INFORMING: FAILED.')
    } finally {
      console.log('👉 RESETTING SESSION REQUEST EVENT.')
      setSessionRequestEvent(undefined)
      setSessionRequestData(undefined)
      setLoading('')
      showToast({ text1: 'DApp request approved', text2: 'You can go back to your browser.' })
    }
  }

  const handleSignSuccess = async (result: SignMessageResult) => {
    if (!sessionRequestEvent) return

    console.log('⏳ INFORMING DAPP THAT SESSION REQUEST SUCCEEDED...')
    await respondToWalletConnectWithSuccess(sessionRequestEvent, result)
    console.log('✅ INFORMING: DONE!')

    console.log('👉 RESETTING SESSION REQUEST EVENT.')
    setSessionRequestEvent(undefined)
    setSessionRequestData(undefined)
    showToast({ text1: 'DApp request approved', text2: 'You can go back to your browser.' })
  }

  const handleRejectPress = async () => {
    if (!sessionRequestEvent) return

    try {
      console.log('⏳ INFORMING DAPP THAT SESSION REQUEST FAILED...')
      await respondToWalletConnectWithError(sessionRequestEvent, getSdkError('USER_REJECTED'))
      console.log('✅ INFORMING: DONE!')
    } catch (e) {
      console.error('❌ INFORMING: FAILED.')
    } finally {
      console.log('👉 RESETTING SESSION REQUEST EVENT.')
      setSessionRequestEvent(undefined)
      setSessionRequestData(undefined)
      showToast({ text1: 'DApp request rejected', text2: 'You can go back to your browser.' })
    }
  }

  const handleSendTxOrSignFail = async (error: WalletConnectError) => {
    if (!sessionRequestEvent) return

    try {
      console.log('⏳ INFORMING DAPP THAT SESSION REQUEST FAILED...')
      await respondToWalletConnectWithError(sessionRequestEvent, error)
      console.log('✅ INFORMING: DONE!')
    } catch (e) {
      console.error('❌ INFORMING: FAILED.')
    } finally {
      console.log('👉 RESETTING SESSION REQUEST EVENT.')
      setSessionRequestEvent(undefined)
      setSessionRequestData(undefined)
    }
  }

  const handleSessionRequestModalClose = async () => {
    setIsSessionRequestModalOpen(false)
    onSessionRequestModalClose()
  }

  const onSessionRequestModalClose = async () => {
    console.log('👉 CLOSING MODAL.')

    if (sessionRequestEvent && walletConnectClient && walletConnectClient?.getPendingSessionRequests().length > 0) {
      console.log('👉 USER CLOSED THE MODAL WITHOUT REJECTING/APPROVING SO WE NEED TO REJECT.')
      handleRejectPress()
    }
  }

  useEffect(() => {
    if (sessionRequestEvent === undefined && isSessionRequestModalOpen) setIsSessionRequestModalOpen(false)
  }, [isSessionRequestModalOpen, sessionRequestEvent])

  useEffect(() => {
    if (!isAuthenticated || !url || !url.startsWith('wc:') || wcDeepLink.current === url) return

    if (!isWalletConnectEnabled) {
      showToast({
        text1: 'Experimental feature',
        text2: 'WalletConnect is an experimental feature. You can enable it in the settings.',
        type: 'info'
        // onPress: () => navigation.navigate('SettingsScreen')
      })
    } else if (walletConnectClient) {
      pairWithDapp(url)

      wcDeepLink.current = url
    }
  }, [isAuthenticated, isWalletConnectEnabled, pairWithDapp, url, walletConnectClient])

  const resetWalletConnectClientInitializationAttempts = () => {
    if (walletConnectClientInitializationAttempts === MAX_WALLETCONNECT_RETRIES)
      setWalletConnectClientInitializationAttempts(0)
  }

  return (
    <WalletConnectContext.Provider
      value={{
        pairWithDapp,
        unpairFromDapp,
        walletConnectClient,
        activeSessions,
        resetWalletConnectClientInitializationAttempts
      }}
    >
      {children}
      <Portal>
        {sessionProposalEvent && (
          <BottomModal
            isOpen={isSessionProposalModalOpen}
            onClose={() => setIsSessionProposalModalOpen(false)}
            Content={(props) => (
              <WalletConnectSessionProposalModal
                approveProposal={approveProposal}
                rejectProposal={rejectProposal}
                proposalEvent={sessionProposalEvent}
                {...props}
              />
            )}
          />
        )}
        {sessionRequestData && (
          <BottomModal
            isOpen={isSessionRequestModalOpen}
            onClose={handleSessionRequestModalClose}
            Content={(props) => (
              <WalletConnectSessionRequestModal
                requestData={sessionRequestData}
                onApprove={handleApprovePress}
                onReject={handleRejectPress}
                onSendTxOrSignFail={handleSendTxOrSignFail}
                onSignSuccess={handleSignSuccess}
                metadata={activeSessionMetadata}
                {...props}
              />
            )}
          />
        )}
      </Portal>
      <SpinnerModal isActive={!!loading} text={loading} />
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

export const useWalletConnectContext = () => useContext(WalletConnectContext)
