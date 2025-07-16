// When API error codes are available, replace this substring check with a proper error code check
// https://github.com/alephium/alephium-frontend/issues/610
const getErrorString = (error: unknown) => (error as unknown as string).toString().toLowerCase()

export const isInsufficientFundsError = (error: unknown) => {
  const errorString = getErrorString(error)

  return errorString.includes('not enough') || errorString.includes('insufficient funds')
}

export const isConsolidationError = (error: unknown) => {
  const errorString = getErrorString(error)

  return errorString.includes('consolidating') || errorString.includes('consolidate')
}
