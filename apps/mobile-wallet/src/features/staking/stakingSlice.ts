import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const sliceName = 'staking'

type StakingState = {
  isStaking: boolean
  isUnstaking: boolean
  isClaiming: boolean
  isCanceling: boolean
}

const initialState: StakingState = {
  isStaking: false,
  isUnstaking: false,
  isClaiming: false,
  isCanceling: false
}

const stakingSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setIsStaking: (state, action: PayloadAction<boolean>) => {
      state.isStaking = action.payload
    },
    setIsUnstaking: (state, action: PayloadAction<boolean>) => {
      state.isUnstaking = action.payload
    },
    setIsClaiming: (state, action: PayloadAction<boolean>) => {
      state.isClaiming = action.payload
    },
    setIsCanceling: (state, action: PayloadAction<boolean>) => {
      state.isCanceling = action.payload
    }
  }
})

export default stakingSlice

export const { setIsStaking, setIsUnstaking, setIsClaiming, setIsCanceling } = stakingSlice.actions
