import { selectDefaultAddressHash } from '@alephium/shared'
import { groupOfAddress } from '@alephium/web3'
import { useEffect, useMemo } from 'react'

import { getPowfiSdk, networkIdToSdkNetworkId } from '~/api/powfi'
import { useAppSelector } from '~/hooks/redux'
import { signer } from '~/signer'

type PowfiSdkSigner = ReturnType<typeof getPowfiSdk>['signer']

const usePowfiSdk = () => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)

  const sdk = useMemo(() => {
    const sdkNetworkId = networkIdToSdkNetworkId(networkId)
    const powfiSdk = getPowfiSdk(sdkNetworkId)

    powfiSdk.signer = signer as unknown as PowfiSdkSigner
    powfiSdk.setCurrentProviders()

    return powfiSdk
  }, [networkId])

  useEffect(() => {
    let isCancelled = false

    if (!defaultAddressHash) {
      sdk.clearAccount()
      return
    }

    const syncAccount = async () => {
      try {
        const publicKey = await signer.getPublicKey(defaultAddressHash)

        if (isCancelled) return

        sdk.account = {
          address: defaultAddressHash,
          group: groupOfAddress(defaultAddressHash),
          keyType: 'default',
          publicKey
        }
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
  }, [defaultAddressHash, sdk])

  return sdk
}

export default usePowfiSdk
