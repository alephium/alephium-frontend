import { canHaveTargetGroup, GenerateAddressProps, NonSensitiveAddressDataWithGroup } from '@alephium/keyring'
import { AlephiumApp as AlephiumLedgerApp } from '@alephium/ledger-app'
import {
  AddressBase,
  AddressHash,
  AddressStoredMetadataWithoutHash,
  findNextAvailableAddressIndex
} from '@alephium/shared'
import { KeyType, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { getHDWalletPath } from '@alephium/web3-wallet'
import TransportWebHID from '@ledgerhq/hw-transport-webhid'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'

import { AccountDiscovery } from '@/features/ledger/discovery'

export const getLedgerTransport = async () => {
  try {
    return TransportWebHID.create()
  } catch (e) {
    console.log('Web HID not supported.', e)
  }
  return TransportWebUSB.create()
}

// Heavily inspired by the code in the extension wallet
export class LedgerAlephium extends AccountDiscovery {
  app: AlephiumLedgerApp

  static async create(): Promise<LedgerAlephium> {
    const transportPromise = getLedgerTransport()
    const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    const transport = await Promise.race([transportPromise, timeoutPromise])

    try {
      const app = new AlephiumLedgerApp(transport)
      const version = await app.getVersion()
      console.debug(`Ledger app version: ${version}`)
      return new LedgerAlephium(app)
    } catch (error) {
      await transport.close()
      throw error
    }
  }

  private constructor(app: AlephiumLedgerApp) {
    super()
    this.app = app
  }

  private _deriveAddress = async (
    startIndex: number,
    keyType: 'default' | 'bip340-schnorr',
    _group?: number
  ): Promise<NonSensitiveAddressDataWithGroup> => {
    const path = getHDWalletPath(keyType, startIndex)
    const [{ address: hash, publicKey, group }, index] = await this.app.getAccount(path, _group, keyType)

    return { hash, publicKey, index, group, keyType }
  }

  public getDeviceInfo = async () => ({
    version: await this.app.getVersion(),
    deviceModal: this.app.transport.deviceModel?.productName
  })

  public generateInitialAddress = async () => {
    const address = await this._deriveAddress(0, 'default')

    this.close()

    return address
  }

  public generateAddress = async (props: GenerateAddressProps & { keepAppOpen?: boolean }) => {
    const { addressIndex, keyType, skipAddressIndexes = [], keepAppOpen } = props

    if (keyType !== 'default' && keyType !== 'bip340-schnorr') {
      throw new Error(`KeyType ${keyType} is not supported on Ledger`)
    }

    if (
      canHaveTargetGroup(props) &&
      props.group !== undefined &&
      (!Number.isInteger(props.group) || props.group < 0 || props.group >= TOTAL_NUMBER_OF_GROUPS)
    )
      throw new Error(`Could not generate address in group ${props.group}, group is invalid`)

    if (addressIndex !== undefined) {
      if (!Number.isInteger(addressIndex) || addressIndex < 0)
        throw new Error(`Keyring: Could not generate address, ${addressIndex} is not a valid addressIndex`)

      if ((canHaveTargetGroup(props) && props.group !== undefined) || skipAddressIndexes.length > 0)
        throw new Error(
          'Keyring: Could not generate address, invalid arguments passed: when addressIndex is provided the group and skipAddressIndexes should not be provided.'
        )

      return this._deriveAddress(addressIndex, keyType)
    }

    const initialAddressIndex = 0

    let nextAddressIndex = skipAddressIndexes.includes(initialAddressIndex)
      ? findNextAvailableAddressIndex(initialAddressIndex, skipAddressIndexes)
      : initialAddressIndex
    let newAddressData = await this._deriveAddress(nextAddressIndex, keyType, props.group)

    while (canHaveTargetGroup(props) && props.group !== undefined && newAddressData.group !== props.group) {
      nextAddressIndex = findNextAvailableAddressIndex(newAddressData.index, skipAddressIndexes)
      newAddressData = await this._deriveAddress(nextAddressIndex, keyType, props.group)
    }

    if (!keepAppOpen) {
      this.close()
    }

    return newAddressData
  }

  // Copied from extension wallet
  // TODO: Merge with existing address discovery mechanism at discoverAndCacheActiveAddresses
  public async discoverActiveAddresses(
    skipIndexes: number[] = [],
    keyType: KeyType
  ): Promise<NonSensitiveAddressDataWithGroup[]> {
    if (keyType !== 'default' && keyType !== 'bip340-schnorr') {
      throw new Error(`KeyType ${keyType} is not supported on Ledger`)
    }

    const addresses = await this.deriveActiveAccounts(this._deriveAddress, skipIndexes, keyType)

    this.close()

    return addresses
  }

  public signUnsignedTx = async (addressIndex: number, unsignedTx: string) => {
    try {
      const hdPath = getHDWalletPath('default', addressIndex)
      const signature = await this.app.signUnsignedTx(hdPath, Buffer.from(unsignedTx, 'hex'))

      return signature
    } finally {
      await this.close()
    }
  }

  async close() {
    await this.app.close()
  }
}

export const generateUuidFromInitialAddress = async (addressHash: AddressHash) => {
  const msgUint8 = new TextEncoder().encode(addressHash)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

interface GenerateLedgerAddressesFromMetadataProps {
  addressesMetadata: AddressStoredMetadataWithoutHash[]
  onError: (error: Error) => void
}

export const generateLedgerAddressesFromMetadata = async ({
  addressesMetadata,
  onError
}: GenerateLedgerAddressesFromMetadataProps): Promise<AddressBase[]> => {
  const addresses: AddressBase[] = []
  const app = await LedgerAlephium.create().catch(onError)

  if (app) {
    for (const metadata of addressesMetadata) {
      addresses.push({
        ...(await app.generateAddress({ addressIndex: metadata.index, keepAppOpen: true, keyType: 'default' })),
        ...metadata
      })
    }

    app.close()
  }

  return addresses
}
