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

import { NonSensitiveAddressData } from '@alephium/keyring'
import { useNavigate } from 'react-router-dom'

import { usePersistQueryClientContext } from '@/api/persistQueryClientContext'
import { useAppDispatch } from '@/hooks/redux'
import { walletUnlocked } from '@/storage/wallets/walletActions'

const useInitializeAppWithLedgerData = () => {
  const dispatch = useAppDispatch()
  const { restoreQueryCache, clearQueryCache } = usePersistQueryClientContext()
  const navigate = useNavigate()

  const initializeAppWithLedgerData = async (deviceModel: string, initialAddress: NonSensitiveAddressData) => {
    clearQueryCache()
    await restoreQueryCache('', true)

    dispatch(
      walletUnlocked({
        wallet: {
          id: 'test',
          name: deviceModel,
          isPassphraseUsed: true
        },
        initialAddress
      })
    )

    navigate('/wallet/overview')
  }

  return initializeAppWithLedgerData
}

export default useInitializeAppWithLedgerData
