import { useCallback } from 'react'

import { FundPasswordModalProps } from '~/features/fund-password/FundPasswordModal'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const useFundPasswordGuard = () => {
  const dispatch = useAppDispatch()
  const isUsingFundPassword = useAppSelector((s) => s.fundPassword.isActive)

  const triggerFundPasswordAuthGuard = useCallback(
    ({ successCallback }: Pick<FundPasswordModalProps, 'successCallback'>) => {
      if (isUsingFundPassword) {
        dispatch(openModal({ name: 'FundPasswordModal', props: { successCallback } }))
      } else {
        successCallback()
      }
    },
    [dispatch, isUsingFundPassword]
  )

  return {
    triggerFundPasswordAuthGuard
  }
}

export default useFundPasswordGuard
