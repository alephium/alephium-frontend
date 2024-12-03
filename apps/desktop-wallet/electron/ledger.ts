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
import { errorHasMessageProp } from '@alephium/shared'
import web3 from '@alephium/web3-wallet'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { listen } from '@ledgerhq/logs'
import { ipcMain } from 'electron'
import isDev from 'electron-is-dev'

export const setupLedger = () => {
  ipcMain.handle('ledger:connectViaUsb', async () => {
    const connect = async () => {
      const result = await connectToLedger(async (alephiumLedgerApp: AlephiumLedgerApp) => {
        const keyType = 'default'

        const initialAddressPath = web3.getHDWalletPath(keyType, 0)

        const [{ address: hash, publicKey }] = await alephiumLedgerApp.getAccount(
          initialAddressPath,
          undefined,
          keyType
        )
        const version = await alephiumLedgerApp.getVersion()

        const response = {
          success: true,
          version,
          initialAddress: { index: 0, hash, publicKey },
          deviceModel: alephiumLedgerApp.transport.deviceModel?.productName
        }

        return response
      })

      return result
    }

    try {
      return await connect()
    } catch (error) {
      console.error('🔌❌', error)

      // Retry one more time if the error is unknown, usually the Ledger app needs a moment
      if (errorHasMessageProp(error) && error.message.includes('UNKNOWN_ERROR')) {
        return new Promise((s) => setTimeout(s, 1000)).then(connect).catch((error) => ({ success: false, error }))
      }

      return { success: false, error }
    }
  })

  ipcMain.handle('ledger:generateAddress', async (_, index, group) => {
    const result = await connectToLedger(async (alephiumLedgerApp: AlephiumLedgerApp) => {
      const keyType = 'default'

      const addressPath = web3.getHDWalletPath(keyType, index)

      const [{ address: hash, publicKey }] = await alephiumLedgerApp.getAccount(addressPath, group, keyType)

      const response = {
        success: true,
        address: { index, hash, publicKey }
      }

      return response
    })

    return result
  })
}

const connectToLedger = async <T>(callback: (alephiumLedgerApp: AlephiumLedgerApp) => Promise<T>): Promise<T> => {
  console.log('🔌... connecting to Ledger via USB')
  const transport = await TransportNodeHid.open('')
  console.log('🔌✅ connected to Ledger via USB!')

  if (isDev) listen((log) => console.log('Ledger log message:', log.message))

  const alephiumLedgerApp = new AlephiumLedgerApp(transport)

  const version = await alephiumLedgerApp.getVersion()
  console.log('🔌✅ Ledger version:', version)

  const result = await callback(alephiumLedgerApp)

  await transport.close()

  return result
}
