import { CaptureResult, Properties } from 'posthog-js'

import { currentVersion } from '@/utils/app-data'

// The privacy boundary of the desktop wallet: the last thing that touches an event before posthog-js
// sends it.
const scrubbedProperties: Properties = {
  $current_url: '',
  $host: '',
  $referrer: '',
  $referring_domain: '',
  $pathname: '',
  $device_type: '',
  $browser: '',
  $raw_user_agent: '',
  $timezone: '',
  $timezone_offset: '',
  $ip: '',
  $geoip_disable: true
}

export const scrubEvent = (event: CaptureResult | null): CaptureResult | null => {
  if (!event) return event

  // posthog-js builds `$set_once` separately from `properties`, from the session's first page:
  // `$initial_current_url`, `$initial_referrer`, `$initial_pathname`, `$initial_host`. Blanking a
  // property on the event therefore does NOT stop the same value reaching PostHog - `$set_once` is
  // written to the PERSON, where it persists and is never overwritten.
  //
  // Nothing we send uses `$set_once`. The wallet's own person properties go through `$set`, via
  // `posthog.people.set` in useTrackUserSettings - a different bag, deliberately left alone here.
  // So the whole bag goes, which unlike a denylist also covers any `$initial_*` a future posthog-js adds.
  delete event.$set_once

  // `$session_entry_*` mirrors the url/referrer/host properties for the session's first page, and is
  // matched by prefix so a new one added by a future posthog-js release cannot silently leak.
  const sessionEntryProps = Object.keys(event.properties)
    .filter((key) => key.startsWith('$session_entry_'))
    .reduce<Properties>((props, key) => ({ ...props, [key]: '' }), {})

  event.properties = {
    ...event.properties,
    ...sessionEntryProps,
    ...scrubbedProperties,
    desktop_wallet_version: currentVersion
  }

  return event
}

export default scrubEvent
