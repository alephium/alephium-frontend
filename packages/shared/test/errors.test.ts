import { describe, expect, it } from 'vitest'

import { getHumanReadableError } from '../src/errors'

describe('getHumanReadableError', () => {
  describe('with a default error message', () => {
    it('prefixes the default message before an Error message', () => {
      expect(getHumanReadableError(new Error('kaput'), 'def')).toBe('def - kaput')
    })

    it('joins the default message with a plain object message', () => {
      expect(getHumanReadableError({ message: 'm' }, 'def')).toBe('def - m')
    })

    it('falls back to toString when the message is an empty string', () => {
      expect(getHumanReadableError({ message: '' }, 'def')).toBe('def - [object Object]')
    })

    it('falls back to toString when there is no message property', () => {
      expect(getHumanReadableError({}, 'def')).toBe('def - [object Object]')
    })
  })

  describe('without a default error message', () => {
    it('returns only the Error message', () => {
      expect(getHumanReadableError(new Error('kaput'), '')).toBe('kaput')
    })

    it('returns only the toString representation of a bare object', () => {
      expect(getHumanReadableError({}, '')).toBe('[object Object]')
    })

    it('strips the API error prefix from a toString result', () => {
      expect(getHumanReadableError({ toString: () => 'Error: [API Error] - Status code: 503' }, '')).toBe(
        'Status code: 503'
      )
    })

    it('strips only the first occurrence of the API error prefix', () => {
      expect(
        getHumanReadableError({ toString: () => 'Error: [API Error] - Error: [API Error] - Status code: 503' }, '')
      ).toBe('Error: [API Error] - Status code: 503')
    })

    it('returns an empty string when the error has neither message nor toString', () => {
      expect(getHumanReadableError(Object.create(null), '')).toBe('')
    })
  })

  describe('with a primitive or nullish error', () => {
    it('returns just the default message for null', () => {
      expect(getHumanReadableError(null, 'x')).toBe('x')
    })

    it('returns just the default message for undefined', () => {
      expect(getHumanReadableError(undefined, 'x')).toBe('x')
    })

    it('returns an empty string for null without a default message', () => {
      expect(getHumanReadableError(null, '')).toBe('')
    })

    it('appends the stringified value for a string', () => {
      expect(getHumanReadableError('boom', 'x')).toBe('x - boom')
    })

    it('appends the stringified value for a number', () => {
      expect(getHumanReadableError(42, 'x')).toBe('x - 42')
    })

    it('appends the stringified value for a boolean', () => {
      expect(getHumanReadableError(true, 'x')).toBe('x - true')
    })
  })
})
