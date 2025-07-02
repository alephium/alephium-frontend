import { Address, isGrouplessAddress } from '@alephium/shared'
import { capitalize } from 'lodash'

import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import { useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'

export const useNetwork = (): ConnectedAddressPayload['network'] => {
  const network = useAppSelector((s) => s.network)

  return {
    id: network.name,
    name: capitalize(network.name),
    nodeUrl: network.settings.nodeHost,
    explorerApiUrl: network.settings.explorerApiHost,
    explorerUrl: network.settings.explorerUrl
  }
}

export const getConnectedAddressPayload = async (
  network: ConnectedAddressPayload['network'],
  address: Address,
  host: string,
  icon?: string
): Promise<ConnectedAddressPayload> => ({
  address: address.hash,
  network,
  type: 'alephium',
  signer: await getSigner(address),
  host,
  icon
})

const getSigner = async (address: Address): Promise<ConnectedAddressPayload['signer']> => {
  const publicKey = await getAddressAsymetricKey(address.hash, 'public')

  return {
    type: 'local_secret',
    keyType: address.keyType ?? 'default',
    publicKey,
    derivationIndex: address.index,
    group: isGrouplessAddress(address) ? undefined : address.group
  }
}
