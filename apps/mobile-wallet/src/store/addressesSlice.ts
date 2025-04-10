import { AddressBase, DEPRECATED_Address as Address } from '@alephium/shared'
import { groupOfAddress } from '@alephium/web3'
import { createSlice, EntityState, isAnyOf } from '@reduxjs/toolkit'

import { addressMetadataIncludesHash } from '~/persistent-storage/wallet'
import { addressesAdapter } from '~/store/addresses/addressesAdaptor'
import { appLaunchedWithLastUsedWallet, walletUnlocked } from '~/store/wallet/walletActions'

const sliceName = 'addresses'

interface AddressesState extends EntityState<Address> {
  status: 'uninitialized' | 'initialized'
  balancesStatus: 'uninitialized' | 'initialized'
}

const initialState: AddressesState = addressesAdapter.getInitialState({
  status: 'uninitialized',
  balancesStatus: 'uninitialized'
})

const addressesSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(isAnyOf(walletUnlocked, appLaunchedWithLastUsedWallet), (state, { payload: { addresses } }) => {
      const addressesToInitialize = addresses.filter(
        (address) => addressMetadataIncludesHash(address) && !state.entities[address.hash]
      )

      if (addressesToInitialize.length > 0) {
        addressesAdapter.addMany(
          state,
          addressesToInitialize.filter(addressMetadataIncludesHash).map((address) =>
            getInitialAddressState({
              ...address,
              publicKey: '' // TODO: See https://github.com/alephium/alephium-frontend/issues/1317
            })
          )
        )
      }
    })
  }
})

export default addressesSlice

const getInitialAddressState = (addressData: AddressBase): Address => ({
  ...addressData,
  group: groupOfAddress(addressData.hash),
  transactions: [],
  allTransactionPagesLoaded: false,
  balance: '0',
  lockedBalance: '0',
  lastUsed: 0,
  tokens: []
})
