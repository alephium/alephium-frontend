import { findMaxIndexBeforeFirstGap } from '~/utils/addresses'

describe(findMaxIndexBeforeFirstGap, () => {
  it('should return undefined if there are no indexes', () => {
    expect(findMaxIndexBeforeFirstGap([])).toEqual(undefined)
  })

  it('should return the first index if there is only one index', () => {
    expect(findMaxIndexBeforeFirstGap([0])).toEqual(0)
  })

  it('should return index before the first gap', () => {
    expect(findMaxIndexBeforeFirstGap([0, 2, 3, 4])).toEqual(0)
    expect(findMaxIndexBeforeFirstGap([0, 2, 4])).toEqual(0)
    expect(findMaxIndexBeforeFirstGap([0, 1, 4])).toEqual(1)
    expect(findMaxIndexBeforeFirstGap([0, 1, 2, 3, 4])).toEqual(4)
    expect(findMaxIndexBeforeFirstGap([1, 2, 3, 4])).toEqual(undefined)
    expect(findMaxIndexBeforeFirstGap([0])).toEqual(0)
    expect(findMaxIndexBeforeFirstGap([1])).toEqual(undefined)
    expect(findMaxIndexBeforeFirstGap([5])).toEqual(undefined)
    expect(findMaxIndexBeforeFirstGap([1, 5])).toEqual(undefined)
    expect(findMaxIndexBeforeFirstGap([0, 5])).toEqual(0)
    expect(findMaxIndexBeforeFirstGap([])).toEqual(undefined)
  })
})
