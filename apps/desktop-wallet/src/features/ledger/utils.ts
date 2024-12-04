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

import { GenerateAddressProps, NonSensitiveAddressData } from '@alephium/keyring'
import { AlephiumApp as AlephiumLedgerApp } from '@alephium/ledger-app'
import { findNextAvailableAddressIndex } from '@alephium/shared'
import { KeyType, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { getHDWalletPath } from '@alephium/web3-wallet'
import TransportWebHID from '@ledgerhq/hw-transport-webhid'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'

export const getLedgerTransport = async () => {
  try {
    return TransportWebHID.create()
  } catch (e) {
    console.log('Web HID not supported.', e)
  }
  return TransportWebUSB.create()
}

type NonSensitiveAddressDataWithGroup = NonSensitiveAddressData & { group: number }

export class LedgerAlephium {
  // extends AccountDiscovery
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
    // super()
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

  // private async deriveAccount(
  //   networkId: string,
  //   startIndex: number,
  //   keyType: KeyType,
  //   group?: number
  // ): Promise<WalletAccount> {
  //   const [newAccount, hdIndex] = await this.getAccount(startIndex, group, keyType)
  //   return {
  //     address: newAccount.address,
  //     networkId: networkId,
  //     signer: {
  //       type: 'ledger' as const,
  //       publicKey: newAccount.publicKey,
  //       keyType: newAccount.keyType,
  //       derivationIndex: hdIndex,
  //       group: groupOfAddress(newAccount.address)
  //     },
  //     type: 'alephium'
  //   }
  // }

  // async createNewAccount(networkId: string, targetAddressGroup: number | undefined, keyType: string) {
  //   if (keyType !== 'default') {
  //     throw Error('Unsupported key type: ' + keyType)
  //   }

  //   const existingLedgerAccounts = await getAllLedgerAccounts(networkId)
  //   let index = 0
  //   // eslint-disable-next-line no-constant-condition
  //   while (true) {
  //     const newAccount = await this.deriveAccount(networkId, index, keyType, targetAddressGroup)
  //     if (existingLedgerAccounts.find((account) => account.address === newAccount.address) === undefined) {
  //       await this.app.close()
  //       return newAccount
  //     }
  //     index = newAccount.signer.derivationIndex + 1
  //   }
  // }

  // async verifyAccount(account: Account): Promise<boolean> {
  //   const path = getHDWalletPath(account.signer.keyType, account.signer.derivationIndex)
  //   const [deviceAccount, _] = await this.app.getAccount(path, undefined, account.signer.keyType, true)
  //   await this.app.close()
  //   return deviceAccount.address !== account.address
  // }

  // async signUnsignedTx(account: Account, unsignedTx: Buffer) {
  //   const hdPath = getHDWalletPath(account.signer.keyType, account.signer.derivationIndex)
  //   const signature = await this.app.signUnsignedTx(hdPath, unsignedTx)
  //   await this.app.close()
  //   return signature
  // }

  async close() {
    await this.app.close()
  }

  // public async discoverActiveAccounts(networkId: string): Promise<WalletAccount[]> {
  //   const existingLedgerAccounts = await getAllLedgerAccounts(networkId)
  //   const network = await getNetwork(networkId)
  //   if (!network.explorerUrl) {
  //     return []
  //   }

  //   console.info(`start discovering active ledger accounts for ${networkId}`)
  //   const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
  //   const discoverAccount = (startIndex: number): Promise<WalletAccount> =>
  //     this.deriveAccount(network.id, startIndex, 'default')
  //   const walletAccounts = await this.deriveActiveAccountsForNetwork(explorerProvider, discoverAccount)
  //   const newDiscoveredAccounts = walletAccounts.filter(
  //     (account) => !existingLedgerAccounts.find((a) => a.address === account.address)
  //   )
  //   console.info(`Discovered ${newDiscoveredAccounts.length} new active accounts for ${networkId}`)
  //   return newDiscoveredAccounts
  // }
}
