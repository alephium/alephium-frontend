import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const sliceName = 'staking'

type PendingStakeOrUnstake = {
  type: 'stake' | 'unstake'
  txHash: string
}

export type PendingVaultAction = {
  type: 'claim' | 'cancel'
  txHash: string
}

type StakingState = {
  pendingStakeOrUnstake: PendingStakeOrUnstake | undefined
  pendingVaultActions: Record<string, PendingVaultAction>
}

const initialState: StakingState = {
  pendingStakeOrUnstake: undefined,
  pendingVaultActions: {}
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
    }
  }
})

export default stakingSlice

export const { stakeOrUnstakeStarted, stakeOrUnstakeCompleted, vaultActionStarted, vaultActionCompleted } =
  stakingSlice.actions
