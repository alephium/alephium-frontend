import { getGasRefillChainedTxParams } from '../src/transactions/transactionParams'
import { AddressWithGroup } from '../src/types/addresses'
import { SendFlowData } from '../src/types/transactions'

const makeAddressWithGroup = (hash: string, keyType: AddressWithGroup['keyType']): AddressWithGroup => ({
  hash,
  index: 0,
  group: 0,
  keyType,
  publicKey: '',
  color: '',
  isDefault: false
})

describe('getGasRefillChainedTxParams', () => {
  it('signs the refill tx with the key type of the refilling address', () => {
    const schnorrAddress = makeAddressWithGroup('refill', 'bip340-schnorr')
    const sendFlowData: SendFlowData = {
      fromAddress: makeAddressWithGroup('signer', 'default'),
      toAddress: 'destination',
      assetAmounts: []
    }

    const [refillTxParams] = getGasRefillChainedTxParams(schnorrAddress, sendFlowData)

    expect(refillTxParams.signerAddress).toBe('refill')
    expect(refillTxParams.signerKeyType).toBe('bip340-schnorr')
  })
})
