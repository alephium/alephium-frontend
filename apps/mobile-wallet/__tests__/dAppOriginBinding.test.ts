import type { WebViewMessageEvent } from 'react-native-webview'

import { matchRequestOptionsToAuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsUtils'
import { parseIncomingWebViewDappMessageEvent } from '~/features/ecosystem/dAppMessaging/incomingDappMessage'
import type { DApp } from '~/features/ecosystem/ecosystemTypes'
import {
  getHostFromUrl,
  getKnownDappHosts,
  isDappHostVerified,
  normalizeHost
} from '~/features/ecosystem/ecosystemUtils'

const makeMessageEvent = (data: string, url: string) =>
  ({ nativeEvent: { data, url } }) as unknown as WebViewMessageEvent

describe('getHostFromUrl', () => {
  it('extracts the host (with port) from a URL', () => {
    expect(getHostFromUrl('https://app.alephium.org/some/path?q=1')).toBe('app.alephium.org')
    expect(getHostFromUrl('https://app.alephium.org:3000/x')).toBe('app.alephium.org:3000')
  })

  it('returns undefined when there is no real host', () => {
    expect(getHostFromUrl('about:blank')).toBeUndefined()
    expect(getHostFromUrl('data:text/html,<h1>hi</h1>')).toBeUndefined()
    expect(getHostFromUrl('not a url')).toBeUndefined()
    expect(getHostFromUrl('')).toBeUndefined()
  })

  it('serializes IDN / Unicode-confusable hosts as punycode so look-alikes are not rendered as Latin text', () => {
    // "аpple.com" where the first character is a Cyrillic "а", not the Latin "a".
    const host = getHostFromUrl('https://аpple.com')

    expect(host).toBeDefined()
    expect(host).not.toBe('apple.com')
    expect(host?.startsWith('xn--')).toBe(true)
  })
})

describe('parseIncomingWebViewDappMessageEvent (origin binding)', () => {
  const signMessageEvent = (claimedHost: string, senderUrl: string) =>
    makeMessageEvent(
      JSON.stringify({
        type: 'ALPH_SIGN_MESSAGE',
        data: { host: claimedHost, message: 'gm', signerAddress: '1abc', messageHasher: 'alephium' }
      }),
      senderUrl
    )

  it('binds the request to the REAL origin and ignores a forged host in the message body', () => {
    // Attack: a page served from evil.com claims to be app.alephium.org inside the message body.
    const parsed = parseIncomingWebViewDappMessageEvent(signMessageEvent('app.alephium.org', 'https://evil.com/login'))

    expect(parsed).not.toBeNull()
    // What the wallet actually acts on / displays — the real origin, never the forged one.
    expect(parsed?.senderHost).toBe('evil.com')
    // The forged host is kept ONLY so we can detect/log the spoofing attempt; it is never trusted.
    expect(parsed?.claimedHost).toBe('app.alephium.org')
  })

  it('extracts the claimed host from a connect request too', () => {
    const parsed = parseIncomingWebViewDappMessageEvent(
      makeMessageEvent(
        JSON.stringify({ type: 'ALPH_CONNECT_DAPP', data: { host: 'app.alephium.org', group: 0 } }),
        'https://evil.com'
      )
    )

    expect(parsed?.senderHost).toBe('evil.com')
    expect(parsed?.claimedHost).toBe('app.alephium.org')
  })

  it('drops messages with an unfamiliar type', () => {
    expect(
      parseIncomingWebViewDappMessageEvent(
        makeMessageEvent(JSON.stringify({ type: 'NOT_A_REAL_TYPE', data: {} }), 'https://x.com')
      )
    ).toBeNull()
  })

  it('drops malformed payloads', () => {
    expect(parseIncomingWebViewDappMessageEvent(makeMessageEvent('}{ not json', 'https://x.com'))).toBeNull()
    expect(parseIncomingWebViewDappMessageEvent(makeMessageEvent('"just a string"', 'https://x.com'))).toBeNull()
    expect(parseIncomingWebViewDappMessageEvent(makeMessageEvent('42', 'https://x.com'))).toBeNull()
  })

  it('leaves senderHost undefined when the real origin cannot be determined', () => {
    const parsed = parseIncomingWebViewDappMessageEvent(signMessageEvent('app.alephium.org', 'about:blank'))

    expect(parsed).not.toBeNull()
    expect(parsed?.senderHost).toBeUndefined()
  })
})

describe('matchRequestOptionsToAuthorizedConnection (a forged host cannot reuse another origin authorization)', () => {
  const storedConnection = { host: 'app.alephium.org', address: '1abc', dateTime: 0 }

  it('does not match when the trusted request host differs from the stored one', () => {
    expect(matchRequestOptionsToAuthorizedConnection({ host: 'evil.com' })(storedConnection)).toBe(false)
  })

  it('matches when the trusted request host equals the stored one', () => {
    expect(matchRequestOptionsToAuthorizedConnection({ host: 'app.alephium.org' })(storedConnection)).toBe(true)
  })
})

describe('alph.land dApp registry verification (drives the unverified-dApp sign confirmation)', () => {
  const knownHosts = getKnownDappHosts([
    { links: { website: 'https://app.alephium.org' } },
    { links: { website: 'https://www.alphbanx.com/' } },
    { links: {} },
    {}
  ] as DApp[])

  it('builds a normalized host set from the directory (strips www, skips entries without a website)', () => {
    expect(knownHosts.has('app.alephium.org')).toBe(true)
    expect(knownHosts.has('alphbanx.com')).toBe(true)
    expect(knownHosts.size).toBe(2)
  })

  it('treats a listed host (incl. www and case variants) as verified', () => {
    expect(isDappHostVerified('app.alephium.org', knownHosts)).toBe(true)
    expect(isDappHostVerified('www.alphbanx.com', knownHosts)).toBe(true)
    expect(isDappHostVerified('ALPHBANX.com', knownHosts)).toBe(true)
  })

  it('treats an unlisted host as unverified (so it requires explicit sign-time approval)', () => {
    expect(isDappHostVerified('evil.com', knownHosts)).toBe(false)
    expect(isDappHostVerified('elexiurn.finance', knownHosts)).toBe(false)
  })

  it('normalizeHost lowercases and strips a leading www', () => {
    expect(normalizeHost('WWW.Example.com')).toBe('example.com')
    expect(normalizeHost('app.example.com')).toBe('app.example.com')
    expect(normalizeHost(undefined)).toBeUndefined()
  })
})
