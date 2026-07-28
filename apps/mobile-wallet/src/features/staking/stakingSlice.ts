import { AddressHash } from '@alephium/shared/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const sliceName = 'staking'

type PendingStakeOrUnstake = {
  type: 'stake' | 'unstake'
  txHash: string
}

type PendingVaultAction = {
  type: 'claim' | 'cancel'
  txHash: string
}

type StakingState = {
  pendingStakeOrUnstake: PendingStakeOrUnstake | undefined
  pendingVaultActions: Record<string, PendingVaultAction>
  // Session-only (not persisted). Undefined = use the wallet default (see selectStakingAddressHash).
  selectedAddressHash?: AddressHash
}

const initialState: StakingState = {
  pendingStakeOrUnstake: undefined,
  pendingVaultActions: {},
  selectedAddressHash: undefined
}

const stakingSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    stakeOrUnstakeStarted: (state, action: PayloadAction<PendingStakeOrUnstake>) => {
      state.pendingStakeOrUnstake = action.payload
    },
    stakeOrUnstakeCompleted: (state) => {
      state.pendingStakeOrUnstake = undefined
    },
    vaultActionStarted: (state, action: PayloadAction<{ vaultIndex: string } & PendingVaultAction>) => {
      const { vaultIndex, type, txHash } = action.payload
      state.pendingVaultActions[vaultIndex] = { type, txHash }
    },
    vaultActionCompleted: (state, action: PayloadAction<string>) => {
      delete state.pendingVaultActions[action.payload]
    },
    stakingAddressChanged: (state, action: PayloadAction<AddressHash>) => {
      state.selectedAddressHash = action.payload
    }
  }
})

export default stakingSlice

export const {
  stakeOrUnstakeStarted,
  stakeOrUnstakeCompleted,
  vaultActionStarted,
  vaultActionCompleted,
  stakingAddressChanged
} = stakingSlice.actions
