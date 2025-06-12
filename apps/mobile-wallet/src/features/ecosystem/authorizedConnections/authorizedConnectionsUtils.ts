import { RequestOptions } from '@alephium/wallet-dapp-provider'
import { groupOfAddress } from '@alephium/web3'

import { AuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsTypes'

export const matchRequestOptionsToAuthorizedConnection =
  (requestOptions: RequestOptions) => (storedConnection: AuthorizedConnection) =>
    storedConnection.host === requestOptions.host &&
    (requestOptions.address === undefined || storedConnection.address === requestOptions.address) &&
    (requestOptions.networkId === undefined || storedConnection.networkName === requestOptions.networkId) &&
    (requestOptions.addressGroup === undefined ||
      groupOfAddress(storedConnection.address) === requestOptions.addressGroup)
