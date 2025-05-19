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
