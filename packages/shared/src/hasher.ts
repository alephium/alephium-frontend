import { MessageHasher } from '@alephium/web3'

export const SAFE_DAPP_MESSAGE_HASHER = 'alephium'

export const isDappMessageHasherAllowed = (messageHasher: MessageHasher): boolean =>
  messageHasher === SAFE_DAPP_MESSAGE_HASHER
