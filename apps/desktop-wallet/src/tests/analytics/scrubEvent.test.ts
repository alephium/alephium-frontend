import { CaptureResult } from 'posthog-js'

// `@/utils/app-data` reads `import.meta.env.VITE_VERSION`, which Vite injects at build time and vitest
// leaves undefined.
vi.mock('@/utils/app-data', () => ({ currentVersion: '5.0.0', isRcVersion: false }))

const { scrubEvent } = await import('@/features/analytics/scrubEvent')

const buildEvent = (overrides: Partial<CaptureResult> = {}): CaptureResult =>
  ({
    uuid: 'test-uuid',
    event: 'Wallet Unlocked',
    properties: {
      $current_url: 'file:///Users/somebody/Applications/alephium.app/index.html',
      $host: 'localhost',
      $referrer: '$direct',
      $referring_domain: '$direct',
      $pathname: '/index.html',
      $device_type: 'Desktop',
      $browser: 'Chrome',
      $raw_user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      $timezone: 'Europe/Athens',
      $timezone_offset: -180,
      $session_entry_url: 'file:///Users/somebody/Applications/alephium.app/index.html',
      $session_entry_referrer: '$direct',
      wallet_name_length: 7
    },
    ...overrides
  }) as CaptureResult

describe('scrubEvent', () => {
  it('Blanks $ip, which no SDK option actually does (`ip: false` is a documented no-op)', () => {
    expect(scrubEvent(buildEvent())?.properties.$ip).toBe('')
  })

  it('Sets $geoip_disable, which suppresses location lookup but NOT the IP itself', () => {
    expect(scrubEvent(buildEvent())?.properties.$geoip_disable).toBe(true)
  })

  it('Drops $set_once entirely, so no $initial_* value is written to the person', () => {
    // posthog-js builds $set_once separately from properties, so blanking properties alone does not
    // stop the value reaching PostHog - it lands on the person instead.
    const event = buildEvent({
      $set_once: {
        $initial_current_url: 'file:///Users/somebody/Applications/alephium.app/index.html',
        $initial_referrer: '$direct',
        $initial_pathname: '/index.html',
        $initial_host: 'localhost'
      }
    })

    expect(scrubEvent(event)?.$set_once).toBeUndefined()
  })

  it('Blanks every property that can identify the machine or the user', () => {
    const properties = scrubEvent(buildEvent())?.properties

    for (const key of [
      '$current_url',
      '$host',
      '$referrer',
      '$referring_domain',
      '$pathname',
      '$device_type',
      '$browser',
      '$raw_user_agent',
      '$timezone',
      '$timezone_offset',
      '$ip'
    ]) {
      expect(properties?.[key]).toBe('')
    }
  })

  it('Blanks $session_entry_* by prefix, so a new one in a future posthog-js cannot leak', () => {
    const properties = scrubEvent(buildEvent())?.properties

    expect(properties?.$session_entry_url).toBe('')
    expect(properties?.$session_entry_referrer).toBe('')
  })

  it('Never leaks the OS username through any property', () => {
    const scrubbed = JSON.stringify(
      scrubEvent(buildEvent({ $set_once: { $initial_current_url: 'file:///Users/somebody/x' } }))
    )

    expect(scrubbed).not.toContain('somebody')
  })

  it('Keeps $set, which carries the person properties useTrackUserSettings sends', () => {
    // `$set` and `$set_once` are different bags. Only the latter holds posthog-js's `$initial_*`
    // properties; `posthog.people.set` writes to the former, and dropping that too would silently take
    // the wallet's own person properties (theme, network, region, ...) down with it.
    const event = buildEvent({ $set: { theme: 'dark', network: 'mainnet', wallets: 2 } })

    expect(scrubEvent(event)?.$set).toEqual({ theme: 'dark', network: 'mainnet', wallets: 2 })
  })

  it('Keeps the event and the product properties we actually want', () => {
    const scrubbed = scrubEvent(buildEvent())

    expect(scrubbed?.event).toBe('Wallet Unlocked')
    expect(scrubbed?.properties.wallet_name_length).toBe(7)
    expect(scrubbed?.properties.desktop_wallet_version).toBeDefined()
  })

  it('Passes a null event through, as posthog-js may hand one to before_send', () => {
    expect(scrubEvent(null)).toBeNull()
  })
})
