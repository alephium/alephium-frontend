import {
  AlephiumWalletSigner,
  getBaseAddressStr,
  GROUPLESS_ADDRESS_KEY_TYPE,
  selectDefaultAddress
} from '@alephium/shared'
import {
  Account,
  addressFromPublicKey,
  addressWithoutExplicitGroupIndex,
  groupOfAddress,
  isGroupedKeyType,
  transactionSign
} from '@alephium/web3'

import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { store } from '~/store/store'

type DefaultAddress = NonNullable<ReturnType<typeof selectDefaultAddress>>

// Some restored/mobile addresses can have incomplete key type metadata. For staking we still need to build a valid
// `Account` object for web3/Powfi, so we validate candidate key types against the stored public key and only keep the
// one that reproduces the selected address.
const resolveAccountFromAddress = async (
  defaultAddress: DefaultAddress,
  getPublicKey: (address: string) => Promise<string>
): Promise<Account> => {
  const publicKey = defaultAddress.publicKey || (await getPublicKey(defaultAddress.hash))
  const normalizedAddress = addressWithoutExplicitGroupIndex(defaultAddress.hash)
  const candidateKeyTypes = [
    ...new Set([defaultAddress.keyType, 'default', GROUPLESS_ADDRESS_KEY_TYPE].filter(Boolean))
  ]

  for (const candidateKeyType of candidateKeyTypes) {
    const keyType = candidateKeyType as DefaultAddress['keyType'] | 'default'
    const derivedAddress = addressFromPublicKey(publicKey, keyType)

    if (derivedAddress !== normalizedAddress) continue

    if (isGroupedKeyType(keyType)) {
      return {
        address: derivedAddress,
        group: groupOfAddress(derivedAddress),
        keyType,
        publicKey
      }
    }

    return {
      address: derivedAddress,
      keyType,
      publicKey
    }
  }

  throw new Error(`Could not resolve account type for address ${defaultAddress.hash}`)
}

class PowfiStakingSigner extends AlephiumWalletSigner {
  public getPublicKey = async (addressStr: string): Promise<string> =>
    getAddressAsymetricKey(getBaseAddressStr(addressStr), 'public')

  public signRaw = async (addressStr: string, tx: string): Promise<string> =>
    transactionSign(tx, await getAddressAsymetricKey(getBaseAddressStr(addressStr), 'private'))

  protected unsafeGetSelectedAccount = async (): Promise<Account> => {
    const defaultAddress = selectDefaultAddress(store.getState())

    if (!defaultAddress) {
      throw new Error('No default address selected')
    }

    return resolveAccountFromAddress(defaultAddress, this.getPublicKey)
  }
}

export const stakingSigner = new PowfiStakingSigner()
