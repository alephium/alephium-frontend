import { useUnsortedAddresses } from '@alephium/shared-react'
import { KeyType } from '@alephium/web3'
import { capitalize } from 'lodash'
import { useCallback } from 'react'

import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import { useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'

interface GetConnectedAddressPayloadProps {
  host: string
  addressStr: string
  keyType?: KeyType
}

const useGetConnectedAddressPayload = () => {
  const unsortedAddresses = useUnsortedAddresses()
  const network = useAppSelector((s) => s.network)

  const getConnectedAddressPayload = useCallback(
    async ({ addressStr, host, keyType }: GetConnectedAddressPayloadProps): Promise<ConnectedAddressPayload | null> => {
      const address = unsortedAddresses.find((address) => address.hash === addressStr)

      if (!address) return null

      const publicKey = await getAddressAsymetricKey(address.hash, 'public')

      return {
        address: addressStr,
        network: {
          id: network.name,
          name: capitalize(network.name),
          nodeUrl: network.settings.nodeHost,
          explorerApiUrl: network.settings.explorerApiHost,
          explorerUrl: network.settings.explorerUrl
        },
        type: 'alephium',
        signer: {
          type: 'local_secret',
          keyType: keyType ?? 'default', // TODO: replace with address.keyType after groupless addresses integration
          publicKey,
          derivationIndex: address.index,
          group: address.group
        },
        host
      }
    },
    [
      network.name,
      network.settings.explorerApiHost,
      network.settings.explorerUrl,
      network.settings.nodeHost,
      unsortedAddresses
    ]
  )

  return { getConnectedAddressPayload }
}

export default useGetConnectedAddressPayload
