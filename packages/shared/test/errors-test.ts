import { cleanExceptionMessage, redactSensitiveData } from '../src/errors'

// A mnemonic is only ever leaked as a RUN of consecutive wordlist words. Isolated words are just
// English - the wordlist contains 'error', 'phrase', 'already', 'address' - so redacting them one
// by one destroyed benign messages without protecting anything.
describe('cleanExceptionMessage', () => {
  it('Redacts a full 24-word mnemonic', () => {
    const cleaned = cleanExceptionMessage(
      new Error(
        'pumpkin price lake liar into school cotton town trial kangaroo wrist trend work slab candy napkin today scene fun answer also bid garage lottery'
      )
    )

    expect(cleaned).toBe('[...]')
  })

  it('Redacts a 12-word mnemonic embedded in a sentence, keeping the sentence readable', () => {
    const cleaned = cleanExceptionMessage(
      new Error('Import failed: pumpkin price lake liar into school cotton town trial kangaroo wrist trend is invalid')
    )

    expect(cleaned).toBe('Import failed: [...] is invalid')
    expect(cleaned).not.toContain('pumpkin')
    expect(cleaned).not.toContain('kangaroo')
  })

  it('Redacts a comma-separated mnemonic', () => {
    const cleaned = cleanExceptionMessage(new Error('Seed: pumpkin, price, lake, liar, into, school, cotton, town'))

    expect(cleaned).not.toContain('pumpkin')
    expect(cleaned).toContain('[...]')
  })

  it('Leaves the real keyring error readable (regression: it used to be mangled)', () => {
    expect(cleanExceptionMessage(new Error('Keyring: Secret recovery phrase already provided'))).toBe(
      'Keyring: Secret recovery phrase already provided'
    )
  })

  it('Leaves isolated wordlist words alone - they are ordinary English', () => {
    expect(cleanExceptionMessage(new Error('This is an error containing abandon and ability'))).toBe(
      'This is an error containing abandon and ability'
    )
  })

  it('Leaves a run shorter than the threshold alone', () => {
    expect(cleanExceptionMessage(new Error('The client cannot access account'))).toBe(
      'The client cannot access account'
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

  it('Redacts on-chain addresses leaked in a sensitive error message', () => {
    const cleaned = cleanExceptionMessage(
      new Error('Not enough balance in 1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH to send transaction')
    )

    expect(cleaned).toContain('<address>')
    expect(cleaned).not.toContain('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
  })
})

describe('redactSensitiveData', () => {
  it('Redacts Alephium addresses', () => {
    expect(redactSensitiveData('Failed to sweep 1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')).toBe(
      'Failed to sweep <address>'
    )
  })

  it('Redacts transaction/contract/token IDs and public keys (hex)', () => {
    expect(redactSensitiveData('tx 503bfb16230888af4924aa8f8250d7d348b862e267d75d3147f1998050b6da69 not found')).toBe(
      'tx <hex> not found'
    )
  })

  it('Redacts URLs, keeping the surrounding readable message intact', () => {
    expect(redactSensitiveData('Request to https://node.example.com/transactions?address=abc failed')).toBe(
      'Request to <url> failed'
    )
  })

  it('Redacts email addresses', () => {
    expect(redactSensitiveData('Contact support at help@example.com for details')).toBe(
      'Contact support at <email> for details'
    )
  })

  it('Leaves ordinary error messages untouched', () => {
    expect(redactSensitiveData('Insufficient funds to cover the transaction fee')).toBe(
      'Insufficient funds to cover the transaction fee'
    )
  })
})
