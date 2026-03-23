import { selectDefaultAddress } from '@alephium/shared'
import { useEffect, useMemo } from 'react'

import { getPowfiSdk, networkIdToSdkNetworkId } from '~/api/powfi'
import { useAppSelector } from '~/hooks/redux'

import { resolveAccountFromAddress, stakingSigner } from '../stakingSigner'

type PowfiSdkSigner = ReturnType<typeof getPowfiSdk>['signer']

const usePowfiSdk = () => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const nodeHost = useAppSelector((s) => s.network.settings.nodeHost)
  const explorerApiHost = useAppSelector((s) => s.network.settings.explorerApiHost)
  const defaultAddress = useAppSelector(selectDefaultAddress)

  const sdk = useMemo(() => {
    const sdkNetworkId = networkIdToSdkNetworkId(networkId)
    const powfiSdk = getPowfiSdk(sdkNetworkId, { nodeHost, explorerApiHost })

    powfiSdk.signer = stakingSigner as unknown as PowfiSdkSigner
    powfiSdk.setCurrentProviders()

    return powfiSdk
  }, [networkId, nodeHost, explorerApiHost])

  useEffect(() => {
    let isCancelled = false

    if (!defaultAddress) {
      sdk.clearAccount()
      return
    }

    const syncAccount = async () => {
      try {
        if (isCancelled) return

        sdk.account = await resolveAccountFromAddress(defaultAddress, stakingSigner.getPublicKey)
      } catch {
        if (!isCancelled) {
          sdk.clearAccount()
        }
      }
    }

    void syncAccount()

    return () => {
      isCancelled = true
    }
  }, [defaultAddress, sdk])

  return sdk
}

export default usePowfiSdk
