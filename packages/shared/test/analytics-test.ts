import { normalizeAnalyticsProps } from '../src/analytics'
import { getDappHost, getHostFromUrl, normalizeHost } from '../src/utils/dApps'

describe('the analytics dApp identity agrees with the authorization one', () => {
  it.each([
    'https://alphpad.com/',
    'https://app.linxlabs.org',
    'https://WWW.AlphPad.com',
    'https://app.linxlabs.org/swap?from=ALPH',
    'https://localhost:3000/x'
  ])('%s resolves to the same host through both paths', (url) => {
    expect(getDappHost(url)).toBe(normalizeHost(getHostFromUrl(url)))
  })
})

describe('getHostFromUrl stays strict', () => {
  it.each(['about:blank', 'data:text/html,<h1>hi</h1>', 'not a url', ''])('rejects %s', (input) => {
    expect(getHostFromUrl(input)).toBeUndefined()
  })
})

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
