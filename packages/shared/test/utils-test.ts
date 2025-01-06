import * as utils from '../src/utils'

describe('utils', function () {
  it('should return an array with unique entries', () => {
    expect(utils.uniq([1, 1, 1, 2])).toEqual([1, 2]),
      expect(utils.uniq([1, 1, 1, 2, 2])).toEqual([1, 2]),
      expect(utils.uniq(['x'])).toEqual(['x']),
      expect(utils.uniq(['x', 'y'])).toEqual(['x', 'y']),
      expect(utils.uniq(['x', 'y', 'y'])).toEqual(['x', 'y']),
      expect(utils.uniq([])).toEqual([]),
      expect(utils.uniq([1, '1'])).toEqual([1, '1'])
  })
})
