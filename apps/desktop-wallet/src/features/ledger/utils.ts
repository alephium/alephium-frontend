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

import { GenerateAddressProps, NonSensitiveAddressDataWithGroup } from '@alephium/keyring'
import { AlephiumApp as AlephiumLedgerApp } from '@alephium/ledger-app'
import { findNextAvailableAddressIndex } from '@alephium/shared'
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
    _group?: number,
    keyType?: KeyType
  ): Promise<NonSensitiveAddressDataWithGroup> => {
    const _keyType = keyType ?? 'default'
    const path = getHDWalletPath(_keyType, startIndex)
    const [{ address: hash, publicKey, group }, index] = await this.app.getAccount(path, _group, _keyType)

    return { hash, publicKey, index, group }
  }

  public getDeviceInfo = async () => ({
    version: await this.app.getVersion(),
    deviceModal: this.app.transport.deviceModel?.productName
  })

  public generateInitialAddress = async () => {
    const address = await this._deriveAddress(0)

    this.close()

    return address
  }

  public generateAddress = async ({ group, addressIndex, skipAddressIndexes = [] }: GenerateAddressProps) => {
    if (group !== undefined && (!Number.isInteger(group) || group < 0 || group >= TOTAL_NUMBER_OF_GROUPS))
      throw new Error(`Could not generate address in group ${group}, group is invalid`)

    if (addressIndex !== undefined) {
      if (!Number.isInteger(addressIndex) || addressIndex < 0)
        throw new Error(`Keyring: Could not generate address, ${addressIndex} is not a valid addressIndex`)

      if (group !== undefined || skipAddressIndexes.length > 0)
        throw new Error(
          'Keyring: Could not generate address, invalid arguments passed: when addressIndex is provided the group and skipAddressIndexes should not be provided.'
        )

      return this._deriveAddress(addressIndex)
    }

    const initialAddressIndex = 0

    let nextAddressIndex = skipAddressIndexes.includes(initialAddressIndex)
      ? findNextAvailableAddressIndex(initialAddressIndex, skipAddressIndexes)
      : initialAddressIndex
    let newAddressData = await this._deriveAddress(nextAddressIndex)

    while (group !== undefined && newAddressData.group !== group) {
      nextAddressIndex = findNextAvailableAddressIndex(newAddressData.index, skipAddressIndexes)
      newAddressData = await this._deriveAddress(nextAddressIndex)
    }

    this.close()

    return newAddressData
  }

  // Copied from extension wallet
  public async discoverActiveAddresses(skipIndexes: number[] = []): Promise<NonSensitiveAddressDataWithGroup[]> {
    return await this.deriveActiveAccounts(this._deriveAddress, skipIndexes)
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
