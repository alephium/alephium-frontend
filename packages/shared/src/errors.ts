import { bip39Words } from '@/bip39'

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

export const cleanExceptionMessage = (error: unknown) =>
  getHumanReadableError(error, '').replace(new RegExp(`\\b(${bip39WordsString})\\b`, 'g'), '[...]')

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
