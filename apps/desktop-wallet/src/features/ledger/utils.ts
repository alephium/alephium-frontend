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

import { AlephiumApp as AlephiumLedgerApp } from '@alephium/ledger-app'
import { KeyType } from '@alephium/web3'
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

export class LedgerAlephium {
  // extends AccountDiscovery
  app: AlephiumLedgerApp

  static async create(): Promise<LedgerAlephium> {
    const transport = await getLedgerTransport()
    const app = new AlephiumLedgerApp(transport)
    const version = await app.getVersion()
    console.debug(`Ledger app version: ${version}`)
    return new LedgerAlephium(app)
  }

  private constructor(app: AlephiumLedgerApp) {
    // super()
    this.app = app
  }

  private async getAccount(startIndex: number, group: number | undefined, keyType: KeyType) {
    const path = getHDWalletPath(keyType, startIndex)
    return await this.app.getAccount(path, group, keyType)
  }

  public getDeviceInfo = async () => ({
    version: await this.app.getVersion(),
    deviceModal: this.app.transport.deviceModel?.productName
  })

  public generateInitialAddress = async (keyType?: KeyType) => this.getAccount(0, undefined, keyType ?? 'default')

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
