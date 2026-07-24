import { addressesAdapter } from '../src/store/addresses/addressesAdapters'
import { selectAllAddressIndexes } from '../src/store/addresses/addressesSelectors'
import { SharedRootState } from '../src/store/store'
import { Address } from '../src/types/addresses'

const makeAddress = (hash: string, index: number, keyType: Address['keyType']): Address =>
  ({
    hash,
    index,
    keyType,
    publicKey: '',
    label: '',
    color: '',
    isDefault: false,
    ...(keyType === 'gl-secp256k1' ? {} : { group: 0 })
  }) as Address

const buildState = (addresses: Address[]): SharedRootState =>
  ({
    addresses: addressesAdapter.setAll(addressesAdapter.getInitialState(), addresses)
  }) as SharedRootState

describe('selectAllAddressIndexes', () => {
  it('tracks an independent index space per key type', () => {
    const state = buildState([
      makeAddress('a', 0, 'default'),
      makeAddress('b', 1, 'default'),
      makeAddress('c', 0, 'bip340-schnorr'),
      makeAddress('d', 2, 'bip340-schnorr'),
      makeAddress('e', 0, 'gl-secp256k1'),
      makeAddress('f', 3, 'gl-secp256k1')
    ])

    const { indexesOfDefaultAddresses, indexesOfSchnorrAddresses, indexesOfGrouplessAddresses } =
      selectAllAddressIndexes(state)

    expect(indexesOfDefaultAddresses).toEqual([0, 1])
    expect(indexesOfSchnorrAddresses).toEqual([0, 2])
    expect(indexesOfGrouplessAddresses).toEqual([0, 3])
  })
})
