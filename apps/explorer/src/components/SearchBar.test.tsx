import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { lightTheme } from '@/styles/themes'

import SearchBar from './SearchBar'

const { displaySnackbar } = vi.hoisted(() => ({ displaySnackbar: vi.fn() }))

vi.mock('@/hooks/useSnackbar', () => ({ useSnackbar: () => ({ displaySnackbar }) }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))

const contractId = 'ab'.repeat(32)
const contractAddress = '26F5exrtYW913Zj83GcK1LMP1VduPQVcVzvqBYkwkJpti'
const blockHash = `0000${'ab'.repeat(30)}`
const blockLikeContractAddress = 'tgxhtTeamQrGNK23VLPLMfuumVwxU6GTEd9o1tTBb1fY'
const publicKey = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
const address = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
const contractIdError = 'A contract ID must contain exactly 64 hexadecimal characters.'

const Location = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <output>{location.pathname}</output>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
    </>
  )
}

describe('SearchBar', () => {
  let container: HTMLDivElement
  let root: Root
  let input: HTMLInputElement
  let select: HTMLSelectElement
  let form: HTMLFormElement
  let button: HTMLButtonElement

  const setSearch = (value: string) => {
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  const setType = (value: 'automatic' | 'contractId') => {
    act(() => {
      select.value = value
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  const submit = () => act(() => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  const path = () => container.querySelector('output')?.textContent

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    vi.clearAllMocks()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    act(() =>
      root.render(
        <ThemeProvider theme={lightTheme}>
          <MemoryRouter>
            <SearchBar />
            <Location />
          </MemoryRouter>
        </ThemeProvider>
      )
    )
    input = container.querySelector('input') as HTMLInputElement
    select = container.querySelector('select') as HTMLSelectElement
    form = container.querySelector('form') as HTMLFormElement
    button = container.querySelector('button[type="submit"]') as HTMLButtonElement
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it('provides labeled native controls in keyboard order and defaults to automatic search', () => {
    expect(form.getAttribute('role')).toBe('search')
    expect(select.getAttribute('aria-label')).toBe('Search type')
    expect(select.value).toBe('automatic')
    expect(Array.from(select.options, ({ text }) => text)).toEqual(['Automatic', 'Contract ID'])
    expect(input.getAttribute('aria-label')).toBe('Search')
    expect(input.placeholder).toBe('Search for an address, a public key, or a tx...')
    expect(button.getAttribute('aria-label')).toBe('Search')
    expect(Array.from(form.querySelectorAll('select, input, button'))).toEqual([select, input, button])
    expect([select.tabIndex, input.tabIndex, button.tabIndex]).toEqual([0, 0, 0])
  })

  it.each([
    ['lowercase', contractId, contractAddress],
    ['uppercase', contractId.toUpperCase(), contractAddress],
    ['mixed case', 'Ab'.repeat(32), contractAddress],
    ['surrounding whitespace', ` \t${contractId}\n `, contractAddress],
    ['a block-like prefix', blockHash, blockLikeContractAddress]
  ])('opens the contract address for %s IDs and resets the search', (_, value, expectedAddress) => {
    setType('contractId')
    expect(input.placeholder).toBe('Search for a contract ID...')
    setSearch(value)
    act(() => input.focus())
    submit()

    expect(path()).toBe(`/addresses/${expectedAddress}`)
    expect(input.value).toBe('')
    expect(select.value).toBe('automatic')
    expect(document.activeElement).not.toBe(input)
    expect(displaySnackbar).not.toHaveBeenCalled()
  })

  it.each([
    ['empty', ''],
    ['whitespace only', '   '],
    ['non-hex', 'g'.repeat(64)],
    ['63 characters', 'a'.repeat(63)],
    ['65 characters', 'a'.repeat(65)],
    ['66 characters', publicKey],
    ['a hex prefix', `0x${contractId}`],
    ['internal whitespace', `${'a'.repeat(31)} ${'b'.repeat(32)}`],
    ['an address', address]
  ])('keeps the input and mode for %s contract IDs and reports a localized error', (_, value) => {
    setType('contractId')
    setSearch(value)
    submit()

    expect(path()).toBe('/')
    expect(input.value).toBe(value)
    expect(select.value).toBe('contractId')
    expect(displaySnackbar).toHaveBeenCalledExactlyOnceWith({ text: contractIdError, type: 'info' })
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const error = container.querySelector('[role="alert"]')
    expect(error?.textContent).toBe(contractIdError)
    expect(input.getAttribute('aria-describedby')).toBe(error?.id)
  })

  it.each([
    ['transaction', contractId, `/transactions/${contractId}`],
    ['uppercase transaction', contractId.toUpperCase(), `/transactions/${contractId.toUpperCase()}`],
    ['block', blockHash, `/blocks/${blockHash}`],
    ['address', address, `/addresses/${address}`],
    ['contract address', contractAddress, `/addresses/${contractAddress}`],
    ['public key', publicKey, '/addresses/13nr2XuF1VYfEgBLsXBQFrZcfzNvACP8cDz5CdAwk6BUz']
  ])('preserves automatic %s routing and trims whitespace', (_, value, expectedPath) => {
    setSearch(`  ${value}  `)
    submit()

    expect(path()).toBe(expectedPath)
    expect(input.value).toBe('')
    expect(displaySnackbar).not.toHaveBeenCalled()
  })

  it.each([
    ['a short hash', 'abc', 'There seems to be an error in the hash format.'],
    ['an invalid address', 'not-an-address', 'There seems to be an error in the address format.']
  ])('preserves automatic errors for %s', (_, value, error) => {
    setSearch(value)
    submit()

    expect(path()).toBe('/')
    expect(input.value).toBe(value)
    expect(displaySnackbar).toHaveBeenCalledExactlyOnceWith({ text: error, type: 'info' })
  })

  it('changes modes without searching or discarding the input', () => {
    setSearch(contractId)
    setType('contractId')
    expect(input.value).toBe(contractId)
    expect(path()).toBe('/')
    setType('automatic')
    expect(input.value).toBe(contractId)
    submit()
    expect(path()).toBe(`/transactions/${contractId}`)
  })

  it.each([
    ['automatic', `/transactions/${contractId}`],
    ['contractId', `/addresses/${contractAddress}`]
  ] as const)('handles native form submission from the input in %s mode', (type, expectedPath) => {
    setType(type)
    setSearch(contractId)
    expect(input.form).toBe(form)
    expect(button.form).toBe(form)

    // Enter uses native form submission. Happy DOM does not implement implicit Enter-key submission,
    // so exercise that submit path directly instead of claiming to simulate a real keyboard action.
    act(() => input.form?.requestSubmit())

    expect(path()).toBe(expectedPath)
    expect(input.value).toBe('')
    expect(select.value).toBe('automatic')
  })

  it('lets the user correct an invalid ID and search using the submit button', () => {
    setType('contractId')
    setSearch('bad input')
    act(() => button.click())
    expect(displaySnackbar).toHaveBeenCalledTimes(1)
    expect(path()).toBe('/')

    setSearch(contractId)
    expect(input.hasAttribute('aria-invalid')).toBe(false)
    expect(container.querySelector('[role="alert"]')).toBeNull()
    act(() => button.click())
    expect(path()).toBe(`/addresses/${contractAddress}`)
    expect(select.value).toBe('automatic')
  })

  it('clears contract validation feedback when switching back to automatic search', () => {
    setType('contractId')
    setSearch('bad input')
    submit()
    expect(input.getAttribute('aria-invalid')).toBe('true')

    setType('automatic')
    expect(input.value).toBe('bad input')
    expect(input.hasAttribute('aria-invalid')).toBe(false)
    expect(input.hasAttribute('aria-describedby')).toBe(false)
    expect(container.querySelector('[role="alert"]')).toBeNull()
  })

  it('supports repeated contract searches and resumes automatic routing after navigation', () => {
    for (let i = 0; i < 2; i++) {
      setType('contractId')
      setSearch(contractId)
      submit()
      expect(path()).toBe(`/addresses/${contractAddress}`)
      expect(select.value).toBe('automatic')
    }

    setSearch(blockHash)
    submit()
    expect(path()).toBe(`/blocks/${blockHash}`)

    act(() => (container.querySelector('output + button') as HTMLButtonElement).click())
    expect(path()).toBe(`/addresses/${contractAddress}`)
    expect(input.value).toBe('')
    expect(select.value).toBe('automatic')

    act(() => (container.querySelector('output + button + button') as HTMLButtonElement).click())
    expect(path()).toBe(`/blocks/${blockHash}`)
    expect(input.value).toBe('')
    expect(select.value).toBe('automatic')
  })
})
