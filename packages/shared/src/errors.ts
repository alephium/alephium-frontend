import { bip39Words } from './bip39'

const bip39WordsString = bip39Words.join('|')

export const getHumanReadableError = (error: unknown, defaultErrorMsg: string) => {
  const messageChunks = []

  if (defaultErrorMsg) messageChunks.push(defaultErrorMsg)
  if (errorHasMessageProp(error) && error.message) {
    messageChunks.push(error.message)
  } else if (typeof error?.toString === 'function') {
    messageChunks.push(error.toString().replace('Error: [API Error] - ', ''))
  }

  return messageChunks.join(' - ')
}

// High-entropy tokens that must never reach analytics: URLs (may embed hosts/paths/query
// params), emails, hex blobs (tx/contract/token IDs, public keys, hashes) and long base58
// strings (addresses, keys). Minimum lengths are set high enough that ordinary prose words
// can never match, so redaction is safe to run on every error reason we send.
const SENSITIVE_DATA_PATTERNS: [RegExp, string][] = [
  [/\bhttps?:\/\/[^\s'"]+/gi, '<url>'],
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '<email>'],
  [/\b(?:0x)?[0-9a-fA-F]{32,}\b/g, '<hex>'],
  [/\b[1-9A-HJ-NP-Za-km-z]{40,}\b/g, '<address>']
]

// Strips on-chain identifiers and other high-entropy secrets from a message before it is sent
// to analytics. Unlike the bip39 pass this is safe on any message, so it is applied to every
// error reason we capture, sensitive or not.
export const redactSensitiveData = (message: string) =>
  SENSITIVE_DATA_PATTERNS.reduce((msg, [pattern, replacement]) => msg.replace(pattern, replacement), message)

// The BIP39 wordlist is ordinary English ('phrase', 'already', 'secret', 'address'), so redacting
// every single occurrence mangles benign messages: 'Keyring: Secret recovery phrase already
// provided' came out of the wallet as 'Keyring: Secret recovery [...] [...] provided', which is
// both unreadable and useless for triaging errors. Only a RUN of consecutive wordlist words can be
// part of a leaked mnemonic, so that is what we redact.
//
// The threshold sits far below the 12-word minimum of a real mnemonic, so any leak worth the name
// is still caught, while being long enough that ordinary prose never trips it.
const MIN_CONSECUTIVE_BIP39_WORDS = 4

// Separators allow a comma as well as whitespace, so a mnemonic pasted as 'abandon, ability, able'
// is caught just like the space-separated form it is normally stored in.
const BIP39_WORD_RUN = new RegExp(
  `\\b(?:${bip39WordsString})(?:[\\s,]+(?:${bip39WordsString})){${MIN_CONSECUTIVE_BIP39_WORDS - 1},}\\b`,
  'gi'
)

export const cleanExceptionMessage = (error: unknown) =>
  redactSensitiveData(getHumanReadableError(error, '').replace(BIP39_WORD_RUN, '[...]'))

export const errorHasMessageProp = (error: unknown): error is { message: string } =>
  'message' in (error as { message?: string })

const extractErrorStatusCode = (error: unknown): number | null => {
  const err = getHumanReadableError(error, '')
  const statusCodeMatch = err?.match(/Status code: (\d+)/)

  return statusCodeMatch ? parseInt(statusCodeMatch[1]) : null
}

export const is5XXError = (error: unknown): boolean => {
  const statusCode = extractErrorStatusCode(error)

  return statusCode !== null && statusCode >= 500 && statusCode <= 599
}
