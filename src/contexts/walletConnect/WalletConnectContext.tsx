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

import { AssetAmount } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { formatChain, isCompatibleAddressGroup, RelayMethod } from '@alephium/walletconnect-provider'
import { ApiRequestArguments, SignExecuteScriptTxParams, SignExecuteScriptTxResult } from '@alephium/web3'
import { BuildExecuteScriptTxResult, SignResult } from '@alephium/web3/dist/src/api/api-alephium'
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
import { buildCallContractTransaction } from '~/api/transactions'
import Modalize from '~/components/layout/Modalize'
import SpinnerModal from '~/components/SpinnerModal'
import WalletConnectCallContractTxModal from '~/contexts/walletConnect/WalletConnectCallContractTxModal'
import WalletConnectSessionProposalModal from '~/contexts/walletConnect/WalletConnectSessionProposalModal'
import { useAppSelector } from '~/hooks/redux'
import { selectAllAddresses } from '~/store/addressesSlice'
import { Address } from '~/types/addresses'
import { CallContractTxData, DeployContractTxData, TransferUnsignedTxData } from '~/types/transactions'
import { SessionProposalEvent, SessionRequestEvent } from '~/types/walletConnect'
import { WALLETCONNECT_ERRORS } from '~/utils/constants'
import { getActiveWalletConnectSessions, isNetworkValid, parseSessionProposalEvent } from '~/utils/walletConnect'

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
  const {
    ref: walletConnectSessionProposalModalRef,
    open: openWalletConnectSessionProposalModal,
    close: closeWalletConnectSessionProposalModal
  } = useModalize()
  const {
    ref: walletConnectCallContractTxModalRef,
    open: openWalletConnectCallContractTxModal,
    close: closeWalletConnectCallContractTxModal
  } = useModalize()
  const currentNetworkId = useAppSelector((s) => s.network.settings.networkId)
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const posthog = usePostHog()
  const addresses = useAppSelector(selectAllAddresses)

  const [walletConnectClient, setWalletConnectClient] = useState<WalletConnectContextValue['walletConnectClient']>()
  const [activeSessions, setActiveSessions] = useState<SessionTypes.Struct[]>([])
  const [sessionProposalEvent, setSessionProposalEvent] = useState<SessionProposalEvent>()
  const [sessionRequestEvent, setSessionRequestEvent] = useState<SessionRequestEvent>()
  const [loading, setLoading] = useState('')

  const [transferUnsignedTxData, setTransferUnsignedTxData] = useState<TransferUnsignedTxData>()
  const [callContractBuildTxResult, setCallContractBuildTxResult] = useState<BuildExecuteScriptTxResult>()
  const [callContractTxData, setCallContractTxData] = useState<CallContractTxData>()
  const [deployContractUnsignedTxData, setDeployContractUnsignedTxData] = useState<DeployContractTxData>()

  const [isCallContractTxModalOpen, setIsCallContractTxModalOpen] = useState(false)

  const activeSessionMetadata = activeSessions.find((s) => s.topic === sessionRequestEvent?.topic)?.peer.metadata

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

  const respond = useCallback(
    async (event: SessionRequestEvent, response: EngineTypes.RespondParams['response']) => {
      if (!walletConnectClient) return

      console.log('⏳ RESPONDING TO WC WITH:', { topic: event.topic, response })

      await walletConnectClient.respond({ topic: event.topic, response })

      console.log('✅ RESPONDING: DONE!')
    },
    [walletConnectClient]
  )

  const respondWithSuccess = async (event: SessionRequestEvent, result: SignResult) => {
    await respond(event, { id: event.id, jsonrpc: '2.0', result })
  }

  const respondWithError = useCallback(
    async (event: SessionRequestEvent, error: ReturnType<typeof getSdkError>) =>
      await respond(event, { id: event.id, jsonrpc: '2.0', error }),
    [respond]
  )

  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      if (!walletConnectClient) return

      console.log('📣 RECEIVED EVENT TO PROCESS A SESSION REQUEST FROM THE DAPP.')
      console.log('🪵 REQUESTED METHOD:', requestEvent.params.request.method)

      console.log('REQUEST EVENT:', requestEvent)

      switch (requestEvent.params.request.method as RelayMethod) {
        // case 'alph_signAndSubmitTransferTx': {
        //   const { destinations, signerAddress, gasAmount, gasPrice } = requestEvent.params.request
        //     .params as SignTransferTxParams
        //   const { address: toAddress, tokens, attoAlphAmount } = destinations[0]
        //   const assetAmounts = [
        //     { id: ALPH.id, amount: BigInt(attoAlphAmount) },
        //     ...(tokens ? tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
        //   ]

        //   const fromAddress = addresses.find((address) => address.hash === signerAddress)

        //   if (!fromAddress) {
        //     return respondWithError(requestEvent, {
        //       message: 'Signer address doesn\t exist',
        //       code: WALLETCONNECT_ERRORS.SIGNER_ADDRESS_DOESNT_EXIST
        //     })
        //   }

        //   const txData: TransferTxData = {
        //     fromAddress,
        //     toAddress,
        //     assetAmounts,
        //     gasAmount,
        //     gasPrice: gasPrice?.toString()
        //   }

        //   console.log('🪵 TX DATA TO APPROVE:', txData)
        //   console.log('⏳ OPENING MODAL...')
        //   setTransferTxData(txData)

        //   break
        // }
        // case 'alph_signAndSubmitDeployContractTx': {
        //   const { signerAddress, initialAttoAlphAmount, bytecode, issueTokenAmount, gasAmount, gasPrice } = requestEvent
        //     .params.request.params as SignDeployContractTxParams
        //   const initialAlphAmount: AssetAmount | undefined = initialAttoAlphAmount
        //     ? { id: ALPH.id, amount: BigInt(initialAttoAlphAmount) }
        //     : undefined

        //   const fromAddress = addresses.find((address) => address.hash === signerAddress)

        //   if (!fromAddress) {
        //     return respondWithError(requestEvent, {
        //       message: 'Signer address doesn\t exist',
        //       code: WALLETCONNECT_ERRORS.SIGNER_ADDRESS_DOESNT_EXIST
        //     })
        //   }

        //   const txData: DeployContractTxData = {
        //     fromAddress,
        //     bytecode,
        //     initialAlphAmount,
        //     issueTokenAmount: issueTokenAmount?.toString(),
        //     gasAmount,
        //     gasPrice: gasPrice?.toString()
        //   }

        //   console.log('🪵 TX DATA TO APPROVE:', txData)
        //   console.log('⏳ OPENING MODAL...')
        //   setDeployContractTxData(txData)

        //   break
        // }
        case 'alph_signAndSubmitExecuteScriptTx': {
          const { tokens, bytecode, gasAmount, gasPrice, signerAddress, attoAlphAmount } = requestEvent.params.request
            .params as SignExecuteScriptTxParams
          let assetAmounts: AssetAmount[] = []
          let allAlphAssets: AssetAmount[] = attoAlphAmount ? [{ id: ALPH.id, amount: BigInt(attoAlphAmount) }] : []

          const fromAddress = addresses.find((address) => address.hash === signerAddress)

          if (!fromAddress) {
            return respondWithError(requestEvent, {
              message: 'Signer address doesn\t exist',
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

          setCallContractTxData(wcTxData)

          console.log('⏳ BUILDING TX WITH DATA:', wcTxData)

          setLoading('Responding to WalletConnect')

          const buildCallContractTxResult = await buildCallContractTransaction(wcTxData)

          setLoading('')

          console.log('⏳ OPENING MODAL TO APPROVE TX...')
          setCallContractBuildTxResult(buildCallContractTxResult)
          setSessionRequestEvent(requestEvent)
          openWalletConnectCallContractTxModal()

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
          respondWithError(requestEvent, getSdkError('WC_METHOD_UNSUPPORTED'))
      }
    },
    [addresses, respondWithError, openWalletConnectCallContractTxModal, walletConnectClient]
  )

  const onSessionProposal = useCallback(
    async (sessionProposalEvent: SessionProposalEvent) => {
      console.log('📣 RECEIVED EVENT PROPOSAL TO CONNECT TO A DAPP!')
      console.log('🪵 ARGS:', sessionProposalEvent)
      console.log('⏳ WAITING FOR PROPOSAL APPROVAL OR REJECTION')

      setSessionProposalEvent(sessionProposalEvent)
      openWalletConnectSessionProposalModal()
    },
    [openWalletConnectSessionProposalModal]
  )

  const onSessionDelete = useCallback(
    async (args: SignClientTypes.EventArguments['session_delete']) => {
      console.log('📣 RECEIVED EVENT TO DISCONNECT FROM THE DAPP SESSION.')
      console.log('🪵 ARGS:', args)
      console.log('🧹 CLEANING UP STATE.')

      setSessionProposalEvent(undefined)
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
    }
  }, [
    initializeWalletConnectClient,
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

    if (!walletConnectClient || !sessionProposalEvent) {
      console.error('❌ Could not find WalletConnect client or session proposal event')
      return
    }

    const { id, relayProtocol, requiredNamespace, requiredChains, requiredChainInfo } =
      parseSessionProposalEvent(sessionProposalEvent)

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

      setSessionProposalEvent(undefined)
      setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))

      posthog?.capture('WC: Approved connection')
    } catch (e) {
      console.error('❌ WC: Error while approving and acknowledging', e)
    } finally {
      setLoading('')
      closeWalletConnectSessionProposalModal()
    }
  }

  const rejectProposal = async () => {
    if (!walletConnectClient) return
    if (sessionProposalEvent === undefined) return

    try {
      setLoading('Rejecting...')
      console.log('👎 REJECTING SESSION PROPOSAL...')
      console.log('ID: ', sessionProposalEvent.id)

      await walletConnectClient.reject({ id: sessionProposalEvent.id, reason: getSdkError('USER_REJECTED') })
      setSessionProposalEvent(undefined)

      console.log('✅ REJECTING: DONE!')
    } catch (e) {
      console.error('❌ WC: Error while approving and acknowledging', e)
    } finally {
      setLoading('')
      closeWalletConnectSessionProposalModal()
    }
  }

  // const approveRequest = async (signResult: SignExecuteScriptTxResult) => {
  //   if (!sessionRequestEvent) return

  //   try {
  //     console.log('⏳ INFORMING DAPP THAT SESSION REQUEST SUCCEEDED...')

  //     await respondWithSuccess(sessionRequestEvent, signResult)

  //     console.log('✅ INFORMING: DONE!')
  //   } catch (e) {
  //     console.error('❌ INFORMING: FAILED.')
  //   } finally {
  //     console.log('🪵 RESETTING SESSION REQUEST EVENT.')

  //     setSessionRequestEvent(undefined)
  //   }
  // }

  const handleApprovePress = async (sendTransaction: () => Promise<SignExecuteScriptTxResult | undefined>) => {
    if (!sessionRequestEvent) return

    setLoading('Approving...')

    try {
      const signResult = await sendTransaction()

      if (!signResult) {
        console.log('⏳ DIDNT GET A SIGNATURE RESULT, INFORMING DAPP THAT SESSION REQUEST FAILED...')

        await respondWithError(sessionRequestEvent, {
          message: 'Transaction failed',
          code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
        })

        console.log('✅ INFORMING: DONE!')
      } else {
        console.log('⏳ INFORMING DAPP THAT SESSION REQUEST SUCCEEDED...')

        await respondWithSuccess(sessionRequestEvent, signResult)

        console.log('✅ INFORMING: DONE!')
      }
    } catch (e) {
      console.error('❌ INFORMING: FAILED.')
    } finally {
      console.log('🪵 RESETTING SESSION REQUEST EVENT.')

      setSessionRequestEvent(undefined)
      setLoading('')
    }
  }

  const handleRejectPress = async () => {
    if (!sessionRequestEvent) return

    try {
      console.log('⏳ INFORMING DAPP THAT SESSION REQUEST FAILED...')

      await respondWithError(sessionRequestEvent, getSdkError('USER_REJECTED'))

      console.log('✅ INFORMING: DONE!')
    } catch (e) {
      console.error('❌ INFORMING: FAILED.')
    } finally {
      console.log('🪵 RESETTING SESSION REQUEST EVENT.')

      setSessionRequestEvent(undefined)
    }
  }

  const handleCallContractTxModalClose = async () => {
    setIsCallContractTxModalOpen(false)
    onTxModalClose()
  }

  const onTxModalClose = async () => {
    console.log('🪵 CLOSING MODAL.')

    if (sessionRequestEvent && walletConnectClient && walletConnectClient?.getPendingSessionRequests().length > 0) {
      console.log('🪵 USER CLOSED THE MODAL WITHOUT REJECTING/APPROVING SO WE NEED TO REJECT.')
      handleRejectPress()
    }
  }

  useEffect(() => {
    if (sessionRequestEvent === undefined) {
      if (isCallContractTxModalOpen) {
        closeWalletConnectCallContractTxModal()
      }
    }
  }, [closeWalletConnectCallContractTxModal, isCallContractTxModalOpen, sessionRequestEvent, walletConnectClient])

  return (
    <WalletConnectContext.Provider value={{ pair, unpair, walletConnectClient, activeSessions }}>
      {children}
      <Portal>
        <Modalize ref={walletConnectSessionProposalModalRef}>
          {sessionProposalEvent && (
            <WalletConnectSessionProposalModal
              onClose={closeWalletConnectSessionProposalModal}
              approveProposal={approveProposal}
              rejectProposal={rejectProposal}
              proposalEvent={sessionProposalEvent}
            />
          )}
          {/* {transferTxData && <WalletConnectTransferTxModal />}
          {deployContractTxData && <WalletConnectDeployContractTxModal />} */}
        </Modalize>
        <Modalize
          ref={walletConnectCallContractTxModalRef}
          onOpen={() => setIsCallContractTxModalOpen(true)}
          onClose={handleCallContractTxModalClose}
        >
          {callContractTxData && callContractBuildTxResult && (
            <WalletConnectCallContractTxModal
              wcTxData={callContractTxData}
              unsignedTxData={callContractBuildTxResult}
              onApprove={handleApprovePress}
              onReject={handleRejectPress}
              metadata={activeSessionMetadata}
            />
          )}
        </Modalize>
      </Portal>
      <SpinnerModal isActive={!!loading} text={loading} />
    </WalletConnectContext.Provider>
  )
}

export const useWalletConnectContext = () => useContext(WalletConnectContext)
