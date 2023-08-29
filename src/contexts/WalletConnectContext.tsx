/*
Copyright 2018 - 2022 The Alephium Authors
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

import { AssetAmount, getHumanReadableError } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { formatChain, isCompatibleAddressGroup, RelayMethod } from '@alephium/walletconnect-provider'
import {
  ApiRequestArguments,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignTransferTxParams
} from '@alephium/web3'
import { SignResult } from '@alephium/web3/dist/src/api/api-alephium'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import SignClient from '@walletconnect/sign-client'
import { EngineTypes, SignClientTypes } from '@walletconnect/types'
import { SessionTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { partition } from 'lodash'
import { usePostHog } from 'posthog-react-native'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useModalize } from 'react-native-modalize'
import { Portal } from 'react-native-portalize'
import Toast from 'react-native-root-toast'

import client from '~/api/client'
import Modalize from '~/components/layout/Modalize'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import WalletConnectProposalModal from '~/screens/WalletConnectProposalModal'
import { Address } from '~/types/addresses'
import { CallContractTxData, DeployContractTxData, TransferTxData } from '~/types/transactions'
import { ProposalEvent, RequestEvent } from '~/types/walletConnect'
import { WALLETCONNECT_ERRORS } from '~/utils/constants'
import { getActiveWalletConnectSessions, isNetworkValid, parseProposalEvent } from '~/utils/walletConnect'

interface WalletConnectContextValue {
  walletConnectClient?: SignClient
  pair: (uri: string) => Promise<void>
  unpair: (pairingTopic: string) => Promise<void>
  activeSessions: SessionTypes.Struct[]
}

const initialValues: WalletConnectContextValue = {
  walletConnectClient: undefined,
  pair: () => Promise.resolve(),
  unpair: () => Promise.resolve(),
  activeSessions: []
}

const WalletConnectContext = createContext(initialValues)

export const WalletConnectContextProvider = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigation<NavigationProp<SendNavigationParamList>>()
  const {
    ref: walletConnectProposalModalRef,
    open: openWalletConnectProposalModal,
    close: closeWalletConnectProposalModal
  } = useModalize()
  const currentNetworkId = useAppSelector((s) => s.network.settings.networkId)
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const posthog = usePostHog()

  const [walletConnectClient, setWalletConnectClient] = useState<WalletConnectContextValue['walletConnectClient']>()
  const [activeSessions, setActiveSessions] = useState<SessionTypes.Struct[]>([])

  const [requestEvent, setRequestEvent] = useState<RequestEvent>()
  const [proposalEvent, setProposalEvent] = useState<ProposalEvent>()
  const [sessionTopic, setSessionTopic] = useState<string>()
  const [loading, setLoading] = useState('')

  const initializeWalletConnectClient = useCallback(async () => {
    try {
      console.log('⏳ STEP 1: INITIALIZING WC CLIENT...')

      const client = await SignClient.init({
        projectId: '6e2562e43678dd68a9070a62b6d52207',
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'Alephium mobile wallet',
          description: 'Alephium mobile wallet',
          url: 'https://github.com/alephium/mobile-wallet',
          icons: ['https://alephium.org/favicon-32x32.png']
        }
      })

      setWalletConnectClient(client)
      setActiveSessions(getActiveWalletConnectSessions(client))

      console.log('✅ STEP 1: DONE!')
    } catch (e) {
      console.error('Could not initialize WalletConnect client', e)
    }
  }, [])

  const onSessionRequestResponse = useCallback(
    async (event: RequestEvent, response: EngineTypes.RespondParams['response']) => {
      if (!walletConnectClient) return

      console.log('⏳ RESPONDING TO WC WITH:', { topic: event.topic, response })

      await walletConnectClient.respond({ topic: event.topic, response })

      console.log('✅ RESPONDING: DONE!')

      setRequestEvent(undefined)
    },
    [walletConnectClient]
  )

  const onSessionRequestSuccess = async (event: RequestEvent, result: SignResult) => {
    await onSessionRequestResponse(event, { id: event.id, jsonrpc: '2.0', result })
  }

  const onSessionRequestError = useCallback(
    async (event: RequestEvent, error: ReturnType<typeof getSdkError>) =>
      await onSessionRequestResponse(event, { id: event.id, jsonrpc: '2.0', error }),
    [onSessionRequestResponse]
  )

  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      if (!walletConnectClient) return

      console.log('📣 RECEIVED EVENT TO PROCESS A SESSION REQUEST FROM THE DAPP.')
      console.log('🪵 REQUESTED METHOD:', requestEvent.params.request.method)

      setRequestEvent(requestEvent)
      // setBuildTxCallbacks({
      //   onBuildSuccess: () => navigation.navigate('SendNavigation', { screen: 'VerifyScreen' }),
      //   onConsolidationSuccess: () => navigation.navigate('TransfersScreen')
      // })

      try {
        switch (requestEvent.params.request.method as RelayMethod) {
          case 'alph_signAndSubmitTransferTx': {
            const {
              destinations,
              signerAddress: fromAddress,
              gasAmount,
              gasPrice
            } = requestEvent.params.request.params as SignTransferTxParams
            const { address: toAddress, tokens, attoAlphAmount } = destinations[0]
            const assetAmounts = [
              { id: ALPH.id, amount: BigInt(attoAlphAmount) },
              ...(tokens ? tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
            ]

            const txData: TransferTxData = {
              fromAddress,
              toAddress,
              assetAmounts,
              gasAmount,
              gasPrice: gasPrice?.toString()
            }

            console.log('🪵 TX DATA TO APPROVE:', txData)
            console.log('⏳ OPENING MODAL...')
            // setSendWorkflowType(TxType.TRANSFER)

            break
          }
          case 'alph_signAndSubmitDeployContractTx': {
            const {
              signerAddress: fromAddress,
              initialAttoAlphAmount,
              bytecode,
              issueTokenAmount,
              gasAmount,
              gasPrice
            } = requestEvent.params.request.params as SignDeployContractTxParams
            const initialAlphAmount: AssetAmount | undefined = initialAttoAlphAmount
              ? { id: ALPH.id, amount: BigInt(initialAttoAlphAmount) }
              : undefined

            const txData: DeployContractTxData = {
              fromAddress,
              bytecode,
              initialAlphAmount,
              issueTokenAmount: issueTokenAmount?.toString(),
              gasAmount,
              gasPrice: gasPrice?.toString()
            }

            console.log('🪵 TX DATA TO APPROVE:', txData)
            console.log('⏳ OPENING MODAL...')
            // setSendWorkflowType(TxType.DEPLOY_CONTRACT)

            break
          }
          case 'alph_signAndSubmitExecuteScriptTx': {
            const {
              tokens,
              bytecode,
              gasAmount,
              gasPrice,
              signerAddress: fromAddress,
              attoAlphAmount
            } = requestEvent.params.request.params as SignExecuteScriptTxParams
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
              fromAddress,
              bytecode,
              assetAmounts,
              gasAmount,
              gasPrice: gasPrice?.toString()
            }

            console.log('🪵 TX DATA TO APPROVE:', txData)
            console.log('⏳ OPENING MODAL...')
            // setSendWorkflowType(TxType.SCRIPT)

            break
          }
          case 'alph_requestNodeApi': {
            const p = requestEvent.params.request.params as ApiRequestArguments
            const result = await client.node.request(p)

            console.log('⏳ RESPONDING TO WC WITH THE NODE API')
            await walletConnectClient.respond({
              topic: requestEvent.topic,
              response: { id: requestEvent.id, jsonrpc: '2.0', result }
            })
            console.log('✅ RESPONDING: DONE!')
            break
          }
          case 'alph_requestExplorerApi': {
            const p = requestEvent.params.request.params as ApiRequestArguments
            const result = await client.explorer.request(p)

            console.log('⏳ RESPONDING TO WC WITH THE EXPLORER API')
            await walletConnectClient.respond({
              topic: requestEvent.topic,
              response: { id: requestEvent.id, jsonrpc: '2.0', result }
            })
            console.log('✅ RESPONDING: DONE!')
            break
          }
          default:
            // TODO: support all of the other SignerProvider methods
            onSessionRequestError(requestEvent, getSdkError('WC_METHOD_UNSUPPORTED'))
            throw new Error(`Method not supported: ${requestEvent.params.request.method}`)
        }
      } catch (e) {
        console.error('Error while parsing WalletConnect session request', e)
        // posthog.capture('Error', { message: 'Could not parse WalletConnect session request' })
        onSessionRequestError(requestEvent, {
          message: getHumanReadableError(e, 'Error while parsing WalletConnect session request'),
          code: WALLETCONNECT_ERRORS.PARSING_SESSION_REQUEST_FAILED
        })
      }
    },
    [onSessionRequestError, walletConnectClient]
  )

  const onSessionProposal = useCallback(
    async (proposalEvent: ProposalEvent) => {
      console.log('📣 RECEIVED EVENT PROPOSAL TO CONNECT TO A DAPP!')
      console.log('🪵 ARGS:', proposalEvent)
      console.log('⏳ WAITING FOR PROPOSAL APPROVAL OR REJECTION')

      setProposalEvent(proposalEvent)
      openWalletConnectProposalModal()
    },
    [openWalletConnectProposalModal]
  )

  const onSessionDelete = useCallback(
    async (args: SignClientTypes.EventArguments['session_delete']) => {
      console.log('📣 RECEIVED EVENT TO DISCONNECT FROM THE DAPP SESSION.')
      console.log('🪵 ARGS:', args)
      console.log('🧹 CLEANING UP STATE.')

      setSessionTopic(undefined)
      setProposalEvent(undefined)
      setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))
    },
    [walletConnectClient]
  )

  const onSessionUpdate = useCallback((args: SignClientTypes.EventArguments['session_update']) => {
    console.log('📣 RECEIVED EVENT TO UPDATE SESSION')
    console.log('🪵 ARGS:', args)
  }, [])

  const onSessionEvent = useCallback((args: SignClientTypes.EventArguments['session_event']) => {
    console.log('📣 RECEIVED SESSION EVENT')
    console.log('🪵 ARGS:', args)
  }, [])

  const onSessionPing = useCallback((args: SignClientTypes.EventArguments['session_ping']) => {
    console.log('📣 RECEIVED EVENT TO PING SESSION')
    console.log('🪵 ARGS:', args)
  }, [])

  const onSessionExpire = useCallback((args: SignClientTypes.EventArguments['session_expire']) => {
    console.log('📣 RECEIVED EVENT TO EXPIRE SESSION')
    console.log('🪵 ARGS:', args)
  }, [])

  const onSessionExtend = useCallback((args: SignClientTypes.EventArguments['session_extend']) => {
    console.log('📣 RECEIVED EVENT TO EXTEND SESSION')
    console.log('🪵 ARGS:', args)
  }, [])

  const onProposalExpire = useCallback((args: SignClientTypes.EventArguments['proposal_expire']) => {
    console.log('📣 RECEIVED EVENT TO EXPIRE PROPOSAL')
    console.log('🪵 ARGS:', args)
  }, [])

  const onPairingDelete = useCallback((args: any) => {
    console.log('📣 RECEIVED EVENT TO DELETE PAIRING')
    console.log('🪵 ARGS:', args)
  }, [])
  const onPairingPing = useCallback((args: any) => {
    console.log('📣 RECEIVED EVENT TO PING PAIRING')
    console.log('🪵 ARGS:', args)
  }, [])
  const onPairingExpire = useCallback((args: any) => {
    console.log('📣 RECEIVED EVENT TO EXPIRE PAIRING')
    console.log('🪵 ARGS:', args)
  }, [])

  useEffect(() => {
    if (!walletConnectClient) {
      initializeWalletConnectClient()
    } else {
      console.log('🪵 SUBSCRIBING TO WALLETCONNECT SESSION EVENTS.')

      walletConnectClient.on('session_proposal', onSessionProposal)
      walletConnectClient.on('session_request', onSessionRequest)
      walletConnectClient.on('session_delete', onSessionDelete)
      walletConnectClient.on('session_update', onSessionUpdate)
      walletConnectClient.on('session_event', onSessionEvent)
      walletConnectClient.on('session_ping', onSessionPing)
      walletConnectClient.on('session_expire', onSessionExpire)
      walletConnectClient.on('session_extend', onSessionExtend)
      walletConnectClient.on('proposal_expire', onProposalExpire)
      walletConnectClient.core.pairing.events.on('pairing_delete', onPairingDelete)
      walletConnectClient.core.pairing.events.on('pairing_ping', onPairingPing)
      walletConnectClient.core.pairing.events.on('pairing_expire', onPairingExpire)

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
        walletConnectClient.core.pairing.events.off('pairing_delete', onPairingDelete)
        walletConnectClient.core.pairing.events.off('pairing_ping', onPairingPing)
        walletConnectClient.core.pairing.events.off('pairing_expire', onPairingExpire)
      }
    }
  }, [
    initializeWalletConnectClient,
    onPairingDelete,
    onPairingExpire,
    onPairingPing,
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

  const pair = useCallback(
    async (uri: string) => {
      if (!walletConnectClient) return

      const pairingTopic = uri.substring(3, uri.indexOf('@'))

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
            console.log('🪵 FOUND PENDING PROPOSAL REQUEST!')
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
      }
    },
    [onSessionProposal, walletConnectClient]
  )

  const unpair = useCallback(
    async (topic: string) => {
      if (!walletConnectClient) return

      try {
        setLoading('Disconnecting...')

        console.log('⏳ DISCONNECTING FROM:', topic)
        await walletConnectClient.disconnect({ topic, reason: getSdkError('USER_DISCONNECTED') })
        setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))
        console.log('✅ DISCONNECTING: DONE!')

        posthog?.capture('WC: Disconnected from dApp')
      } catch (e) {
        console.error('❌ COULD NOT DISCONNECT FROM DAPP')
      } finally {
        setLoading('')
      }
    },
    [posthog, walletConnectClient]
  )

  const approveProposal = async (signerAddress: Address) => {
    console.log('👍 USER APPROVED PROPOSAL TO CONNECT TO THE DAPP.')
    console.log('⏳ VERIFYING USER PROVIDED DATA...')

    if (!walletConnectClient || !proposalEvent) {
      console.error('❌ Could not find WalletConnect client or session proposal event')
      return
    }

    const { id, relayProtocol, requiredNamespace, requiredChains, requiredChainInfo } =
      parseProposalEvent(proposalEvent)

    if (requiredChains?.length !== 1) {
      console.error(`❌ Expected exactly 1 required chain in the WalletConnect proposal, got ${requiredChains?.length}`)
      return Toast.show(
        `Expected exactly 1 required chain in the WalletConnect proposal, got ${requiredChains?.length}`
      )
    }

    if (!requiredChainInfo) {
      console.error('❌ Could not find chain requirements in WalletConnect proposal')
      return Toast.show('Could not find chain requirements in WalletConnect proposal')
    }

    if (!isNetworkValid(requiredChainInfo.networkId, currentNetworkId)) {
      console.error(
        `❌ WalletConnect requested the ${requiredChainInfo.networkId} network, but the current network is ${currentNetworkName}.`
      )
      return Toast.show(
        `WalletConnect requested the ${requiredChainInfo.networkId} network, but the current network is ${currentNetworkName}.`
      )
    }

    if (!isCompatibleAddressGroup(signerAddress.group, requiredChainInfo.addressGroup)) {
      console.error(
        `❌ The group of the selected address (${signerAddress.group}) does not match the group required by WalletConnect (${requiredChainInfo.addressGroup})`
      )
      return Toast.show(
        `The group of the selected address (${signerAddress.group}) does not match the group required by WalletConnect (${requiredChainInfo.addressGroup})`
      )
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

      const { topic, acknowledged } = await walletConnectClient.approve({ id, relayProtocol, namespaces })

      console.log('⏳ APPROVAL TOPIC RECEIVED:', topic)

      console.log('⏳ WAITING FOR DAPP ACKNOWLEDGEMENT...')

      const res = await acknowledged()

      console.log('🪵 DID DAPP ACTUALLY ACKNOWLEDGE?', res.acknowledged)
      console.log('✅ APPROVING: DONE!')

      setSessionTopic(topic)
      setProposalEvent(undefined)
      setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))

      posthog?.capture('WC: Approved connection')
    } catch (e) {
      console.error('❌ WC: Error while approving and acknowledging', e)
    } finally {
      setLoading('')
      closeWalletConnectProposalModal()
    }
  }

  const rejectProposal = async () => {
    if (!walletConnectClient) return
    if (proposalEvent === undefined) return

    try {
      setLoading('Rejecting...')
      console.log('👎 REJECTING SESSION PROPOSAL...')
      console.log('ID: ', proposalEvent.id)

      await walletConnectClient.reject({ id: proposalEvent.id, reason: getSdkError('USER_REJECTED') })
      setProposalEvent(undefined)

      console.log('✅ REJECTING: DONE!')
    } catch (e) {
      console.error('❌ WC: Error while approving and acknowledging', e)
    } finally {
      setLoading('')
      closeWalletConnectProposalModal()
    }
  }

  return (
    <WalletConnectContext.Provider value={{ pair, unpair, walletConnectClient, activeSessions }}>
      {children}
      <Portal>
        <Modalize ref={walletConnectProposalModalRef}>
          {proposalEvent && (
            <WalletConnectProposalModal
              onClose={closeWalletConnectProposalModal}
              approveProposal={approveProposal}
              rejectProposal={rejectProposal}
              proposalEvent={proposalEvent}
            />
          )}
        </Modalize>
      </Portal>
      <SpinnerModal isActive={!!loading} text={loading} />
    </WalletConnectContext.Provider>
  )
}

export const useWalletConnectContext = () => useContext(WalletConnectContext)
