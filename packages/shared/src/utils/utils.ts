export function uniq<T>(array: T[]): Array<T> {
  return Array.from(new Set(array))
}

export const isPromiseFulfilled = <T>(p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> =>
  p.status === 'fulfilled'

export const resetArray = (array: Uint8Array) => {
  for (let i = 0; i < array.length; i++) {
    array[i] = 0
  }
}

export const isDefined = <T>(item: T | undefined): item is T => !!item

export const isValidRemoteHttpUrl = (url: string): boolean => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  )
  return pattern.test(url)
}

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
