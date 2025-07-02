import { AddressHash } from '@alephium/shared'
import { KeyType } from '@alephium/web3'

export type NonSensitiveAddressData = {
  hash: AddressHash
  index: number
  publicKey: string
  keyType: KeyType
}

export type NonSensitiveAddressDataWithGroup = NonSensitiveAddressData & { group: number }

export type SensitiveAddressData = NonSensitiveAddressData & {
  privateKey: Uint8Array
}

export type NullableSensitiveAddressData = NonSensitiveAddressData & {
  privateKey: Uint8Array | null
}

export type GenerateAddressWithGroupProps = {
  keyType: 'default' | 'bip340-schnorr'
  group?: number
  addressIndex?: number
  skipAddressIndexes?: number[]
}

export type GenerateGrouplessAddressProps = {
  keyType: Exclude<KeyType, 'default' | 'bip340-schnorr'>
  addressIndex?: number
  skipAddressIndexes?: number[]
}

export type GenerateAddressProps = GenerateAddressWithGroupProps | GenerateGrouplessAddressProps

export const canHaveTargetGroup = (props: GenerateAddressProps): props is GenerateAddressWithGroupProps =>
  props.keyType === 'default' || props.keyType === 'bip340-schnorr'
