import { cleanExceptionMessage } from '@/errors'

describe('cleanExceptionMessage', () => {
  it('Replaces bip39 words with [...]', () => {
    expect(cleanExceptionMessage(new Error('This is an error containing abandon and ability'))).toBe(
      'This is an [...] containing [...] and [...]'
    )
  })

  it('Returns the same message if no bip39 words are found', () => {
    expect(cleanExceptionMessage(new Error('Here is a string with no sensitive words'))).toBe(
      'Here is a string with no sensitive words'
    )
  })

  it('Handles empty error message', () => {
    expect(cleanExceptionMessage(new Error(''))).toBe('Error')
  })

  it('Handles non-string errors', () => {
    expect(cleanExceptionMessage(new Error('Here is a cleaned up error object'))).toBe(
      'Here is a cleaned up [...] [...]'
    )
  })

  it('Replaces words in a full 24-word mnemonic', () => {
    expect(
      cleanExceptionMessage(
        new Error(
          'pumpkin price lake liar into school cotton town trial kangaroo wrist trend work slab candy napkin today scene fun answer also bid garage lottery'
        )
      )
    ).toBe(
      '[...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...] [...]'
    )
  })

  it('Replaces multiple occurrences of the same word', () => {
    expect(cleanExceptionMessage(new Error('Here is a string containing abandon, abandon, and abandon'))).toBe(
      'Here is a string containing [...], [...], and [...]'
    )
  })
})
