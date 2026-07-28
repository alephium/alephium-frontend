import { MIN_SEARCH_TERM_LENGTH } from '@/features/addressFiltering/addressFilteringConstants'
import { getDisplayedAndHiddenTokenIds } from '@/features/assetsLists/getDisplayedAndHiddenTokenIds'

const maxDisplayedTokens = 8
const tokenIds = Array.from({ length: 12 }, (_, i) => `token-${i}`)
const tokensSearchStrings = Object.fromEntries(tokenIds.map((id) => [id, `${id} name ${id} symbol`]))

describe('getDisplayedAndHiddenTokenIds', () => {
  it('displays the first tokens and hides the rest when no search is active', () => {
    expect(
      getDisplayedAndHiddenTokenIds({ tokenIds, maxDisplayedTokens, searchTerm: '', tokensSearchStrings })
    ).toEqual({
      displayedTokenIds: tokenIds.slice(0, 8),
      hiddenTokenIds: tokenIds.slice(8)
    })
  })

  it('ignores a search term shorter than the minimum length', () => {
    const searchTerm = 'token-11'.slice(0, MIN_SEARCH_TERM_LENGTH - 1)

    expect(getDisplayedAndHiddenTokenIds({ tokenIds, maxDisplayedTokens, searchTerm, tokensSearchStrings })).toEqual({
      displayedTokenIds: tokenIds.slice(0, 8),
      hiddenTokenIds: tokenIds.slice(8)
    })
  })

  it('keeps the original split when the search term matches no token', () => {
    expect(
      getDisplayedAndHiddenTokenIds({ tokenIds, maxDisplayedTokens, searchTerm: 'nomatch', tokensSearchStrings })
    ).toEqual({
      displayedTokenIds: tokenIds.slice(0, 8),
      hiddenTokenIds: tokenIds.slice(8)
    })
  })

  it('treats every token as non-matching while the search strings are not loaded yet', () => {
    expect(getDisplayedAndHiddenTokenIds({ tokenIds, maxDisplayedTokens, searchTerm: 'token-11' })).toEqual({
      displayedTokenIds: tokenIds.slice(0, 8),
      hiddenTokenIds: tokenIds.slice(8)
    })
  })

  it('moves a matching token out of the hidden set and to the front', () => {
    expect(
      getDisplayedAndHiddenTokenIds({ tokenIds, maxDisplayedTokens, searchTerm: 'token-11', tokensSearchStrings })
    ).toEqual({
      displayedTokenIds: ['token-11', ...tokenIds.slice(0, 7)],
      hiddenTokenIds: tokenIds.slice(7, 11)
    })
  })

  it('fills the remaining slots with non-matching tokens', () => {
    expect(
      getDisplayedAndHiddenTokenIds({ tokenIds, maxDisplayedTokens, searchTerm: 'token-1', tokensSearchStrings })
    ).toEqual({
      displayedTokenIds: ['token-1', 'token-10', 'token-11', 'token-0', 'token-2', 'token-3', 'token-4', 'token-5'],
      hiddenTokenIds: ['token-6', 'token-7', 'token-8', 'token-9']
    })
  })

  it('displays all matches uncapped when they exceed the maximum, hiding every non-matching token', () => {
    const matchingTokenIds = tokenIds.filter((_, index) => index % 4 !== 0)
    const nonMatchingTokenIds = tokenIds.filter((_, index) => index % 4 === 0)
    const searchStrings = Object.fromEntries(
      tokenIds.map((id) => [id, `${id} ${matchingTokenIds.includes(id) ? 'matchme' : 'other'}`])
    )

    const { displayedTokenIds, hiddenTokenIds } = getDisplayedAndHiddenTokenIds({
      tokenIds,
      maxDisplayedTokens,
      searchTerm: 'matchme',
      tokensSearchStrings: searchStrings
    })

    expect(matchingTokenIds.length).toBeGreaterThan(maxDisplayedTokens)
    expect(displayedTokenIds).toEqual(matchingTokenIds)
    expect(hiddenTokenIds).toEqual(nonMatchingTokenIds)
  })
})
