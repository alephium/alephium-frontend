import { decodeU256List, loadStakingDeployments, StakingContracts } from '@alephium/powfi-sdk'
import { isGrouplessAddressWithoutGroupIndex, type NetworkId } from '@alephium/web3'

const { XAlphToken } = StakingContracts

type NodeCallContractJson = {
  type: string
  returns?: Array<{ type: string; value: unknown }>
  error?: string
}

function stakingContext(sdkNetworkId: NetworkId) {
  const deployments = loadStakingDeployments(sdkNetworkId)
  const xAlph = deployments.contracts.XAlphToken.contractInstance
  const stakeVault = deployments.contracts.XAlphStakeVault.contractInstance
  return { xAlph, stakeVault }
}

function stakerAddress(userAddress: string, stakeVaultGroupIndex: number) {
  return isGrouplessAddressWithoutGroupIndex(userAddress) ? `${userAddress}:${stakeVaultGroupIndex}` : userAddress
}

async function postCallContractReturns(nodeHost: string, body: object) {
  const baseUrl = nodeHost.replace(/\/$/, '')
  const response = await fetch(`${baseUrl}/contracts/call-contract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error(`call-contract HTTP ${response.status}`)
  }

  const json = (await response.json()) as NodeCallContractJson
  if (json.type !== 'CallContractSucceeded') {
    throw new Error(json.error ?? `call-contract failed: ${json.type}`)
  }

  return json.returns ?? []
}

/**
 * @deprecated Temporary workaround only. React Native hits Buffer-related failures in the `@alephium/web3` contract-view
 * stack (`StakingModule.getActiveUnstakeVaultIndexes`, `getClaimableAmount`, etc.). These helpers call the node
 * `POST /contracts/call-contract` with `fetch` and `response.json()` so values stay plain JSON strings. **Remove and
 * use `staking.*` view methods again once the root cause is fixed upstream** (Hermes / polyfills / web3 / powfi-sdk).
 * Duplicates deployment and ABI coupling; do not copy to other views without the same need.
 */
export async function fetchActiveUnstakeRequestsViaNode(
  nodeHost: string,
  sdkNetworkId: NetworkId,
  userAddress: string
): Promise<bigint[]> {
  const { xAlph, stakeVault } = stakingContext(sdkNetworkId)
  const caller = stakerAddress(userAddress, stakeVault.groupIndex)

  const methodIndex = XAlphToken.contract.getMethodIndex('getActiveUnstakeVaultIndexes')
  const body = XAlphToken.contract.toApiCallContract({ args: { caller } }, xAlph.groupIndex, xAlph.address, methodIndex)

  const returns = await postCallContractReturns(nodeHost, body)
  const [first] = returns
  if (!first || first.type !== 'ByteVec' || typeof first.value !== 'string') {
    throw new Error('unexpected getActiveUnstakeVaultIndexes return shape')
  }

  const hex = first.value.replace(/^0x/i, '')
  if (hex.length === 0) {
    return []
  }

  return decodeU256List(hex)
}

/**
 * @deprecated See {@link fetchActiveUnstakeRequestsViaNode} module deprecation — same workaround for
 * `StakingModule.getClaimableAmount`; replace with `staking.getClaimableAmount` when the view stack is fixed.
 */
export async function fetchClaimableAmountViaNode(
  nodeHost: string,
  sdkNetworkId: NetworkId,
  userAddress: string,
  vaultIndex: bigint
): Promise<bigint> {
  const { xAlph, stakeVault } = stakingContext(sdkNetworkId)
  const user = stakerAddress(userAddress, stakeVault.groupIndex)

  const methodIndex = XAlphToken.contract.getMethodIndex('getClaimableAmount')
  const body = XAlphToken.contract.toApiCallContract(
    { args: { user, vaultIndex } },
    xAlph.groupIndex,
    xAlph.address,
    methodIndex
  )

  const returns = await postCallContractReturns(nodeHost, body)
  const [first] = returns
  if (!first || first.type !== 'U256' || typeof first.value !== 'string') {
    throw new Error('unexpected getClaimableAmount return shape')
  }

  return BigInt(first.value)
}
