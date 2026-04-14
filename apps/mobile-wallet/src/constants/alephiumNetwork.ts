import { type NetworkPreset, networkSettingsPresets } from '@alephium/shared'

const networkPresets = Object.keys(networkSettingsPresets) as Array<NetworkPreset>

const resolveNetworkPreset = (candidate?: string | null): NetworkPreset | undefined => {
  if (!candidate) return undefined

  const normalizedCandidate = candidate.toLowerCase() as NetworkPreset

  if (networkPresets.includes(normalizedCandidate)) {
    return normalizedCandidate
  }

  throw new Error(`Invalid network id: ${candidate}`)
}

// Until Powfi mainnet is shipped, staking stays opt-in through an explicit env var. Devs must set it themselves to
// make staking available and choose which Powfi deployment to target.
export const STAKING_NETWORK_OVERRIDE = resolveNetworkPreset(process.env.EXPO_PUBLIC_STAKING_NETWORK_OVERRIDE)
