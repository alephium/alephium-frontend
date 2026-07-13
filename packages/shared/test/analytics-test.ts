import { getDappHost, normalizeAnalyticsProps } from '../src/analytics'

// The three formats that reach analytics in the wild, observed in the 2026-07-13 smoke test:
// WalletConnect metadata.url, the dApp registry's links.website, and the in-app browser's senderHost.
// They must all collapse to the same host or the dApp funnel cannot be joined.
describe('getDappHost', () => {
  it('Collapses the formats a single dApp arrives in into one host', () => {
    expect(getDappHost('https://app.linxlabs.org')).toBe('app.linxlabs.org')
    expect(getDappHost('app.linxlabs.org')).toBe('app.linxlabs.org')
    expect(getDappHost('https://app.linxlabs.org/swap?from=ALPH')).toBe('app.linxlabs.org')
  })

  it('Handles a trailing slash', () => {
    expect(getDappHost('https://alphpad.com/')).toBe(getDappHost('alphpad.com'))
  })

  it('Lowercases and strips www., matching how the wallet identifies a dApp for authorization', () => {
    expect(getDappHost('https://WWW.AlphPad.com')).toBe('alphpad.com')
  })

  it('Returns undefined rather than a junk value', () => {
    expect(getDappHost(undefined)).toBeUndefined()
    expect(getDappHost('')).toBeUndefined()
  })
})

describe('normalizeAnalyticsProps', () => {
  it('Normalises dapp_host so no emit site can reintroduce the inconsistency', () => {
    expect(normalizeAnalyticsProps({ origin: 'dapp_card', dapp_host: 'https://alphpad.com/' })).toEqual({
      origin: 'dapp_card',
      dapp_host: 'alphpad.com'
    })
  })

  it('Leaves props without a dapp_host untouched', () => {
    expect(normalizeAnalyticsProps({ origin: 'dashboard' })).toEqual({ origin: 'dashboard' })
    expect(normalizeAnalyticsProps(undefined)).toBeUndefined()
  })
})
