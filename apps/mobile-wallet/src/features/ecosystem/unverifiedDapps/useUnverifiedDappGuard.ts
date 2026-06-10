import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { dAppsQuery } from '~/api/queries/dAppQueries'
import { getKnownDappHosts, isDappHostVerified } from '~/features/ecosystem/ecosystemUtils'
import {
  acknowledgeUnverifiedDapp,
  isUnverifiedDappAcknowledged
} from '~/features/ecosystem/unverifiedDapps/acknowledgedUnverifiedDappsStorage'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const useUnverifiedDappGuard = () => {
  const { data: knownDappHosts } = useQuery(dAppsQuery({ select: getKnownDappHosts }))
  const walletId = useAppSelector((s) => s.wallet.id)
  const dispatch = useAppDispatch()

  const triggerUnverifiedDappGuard = useCallback(
    ({ dAppHost, onConfirm, orReject }: { dAppHost: string; onConfirm: () => void; orReject: () => void }) => {
      const requiresUnverifiedDappConfirmation =
        dAppHost !== undefined &&
        knownDappHosts !== undefined &&
        !isDappHostVerified(dAppHost, knownDappHosts) &&
        !isUnverifiedDappAcknowledged(walletId, dAppHost)

      if (!requiresUnverifiedDappConfirmation) {
        return onConfirm()
      }

      dispatch(
        openModal({
          name: 'UnverifiedDappModal',
          onUserDismiss: () => orReject(),
          props: {
            dAppHost,
            onConfirm: () => {
              acknowledgeUnverifiedDapp(walletId, dAppHost)
              onConfirm()
            }
          }
        })
      )
    },
    [dispatch, knownDappHosts, walletId]
  )

  return {
    triggerUnverifiedDappGuard
  }
}

export default useUnverifiedDappGuard
