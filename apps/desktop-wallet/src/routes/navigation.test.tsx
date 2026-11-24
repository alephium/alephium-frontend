import { act, ReactNode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { HashRouter, useNavigate } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { StepsContextProvider, useStepsContext } from '@/contexts/steps'
import Router from '@/routes'

const wallet = vi.hoisted(() => ({ activeId: 'test-wallet' as string | undefined }))
vi.mock('@alephium/shared-react', () => ({
  ApiContextProvider: ({ children }: { children: ReactNode }) => children,
  useAddressesDataPolling: vi.fn(),
  useRecoverTokenResolutionFallbacks: vi.fn()
}))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (value: string) => value }) }))
vi.mock('@/hooks/redux', () => ({ useAppSelector: () => wallet.activeId }))
vi.mock('@/api/usePrefetchQueries', () => ({ default: vi.fn() }))
vi.mock('@/utils/contacts', () => ({ loadContacts: vi.fn() }))
vi.mock('@/modals/AppModals', () => ({ AppModalsUnlockedWallet: () => null }))
vi.mock('@/pages/unlockedWallet/UnlockedWalletLayout', () => ({
  default: ({ children }: { children: ReactNode }) => children
}))
vi.mock('@/pages/unlockedWallet/overviewPage/OverviewPage', () => ({ default: () => <div data-page="overview" /> }))
vi.mock('@/pages/unlockedWallet/activityPage/ActivityPage', () => ({ default: () => <div data-page="activity" /> }))
vi.mock('@/pages/unlockedWallet/addressesPage/AddressesPage', () => ({ default: () => <div data-page="addresses" /> }))
vi.mock('@/pages/welcomePage/WelcomePage', () => ({ default: () => <div data-page="welcome" /> }))
vi.mock('@/features/ledger/ConnectLedgerInstructionsPage', () => ({ default: () => <div data-page="ledger" /> }))
vi.mock('@/pages/NewWallet/WalletWordsPage', () => ({ default: () => <div data-page="words" /> }))
vi.mock('@/pages/NewWallet/CheckWordsIntroPage', () => ({ default: () => <div data-page="check-intro" /> }))
vi.mock('@/pages/NewWallet/CheckWordsPage', () => ({ default: () => <div data-page="check" /> }))
vi.mock('@/pages/NewWallet/CreateWalletPage', () => ({ default: () => <div data-page="create" /> }))
vi.mock('@/pages/NewWallet/WalletWelcomePage', () => ({ default: () => <div data-page="complete" /> }))
vi.mock('@/pages/NewWallet/ImportWordsPage', () => ({ default: () => <div data-page="import" /> }))
vi.mock('@/pages/NewWallet/NewWalletLayout', () => ({
  default: ({ baseUrl, steps }: { baseUrl: string; steps: ReactNode[] }) => (
    <StepsContextProvider baseUrl={baseUrl} stepElements={steps}>
      <StepButtons />
    </StepsContextProvider>
  )
}))

function StepButtons() {
  const { onButtonNext, onButtonBack } = useStepsContext()
  return (
    <>
      <button onClick={onButtonNext}>Next</button>
      <button onClick={onButtonBack}>Back</button>
    </>
  )
}

function Navigation() {
  const navigate = useNavigate()
  return (
    <button data-nav onClick={() => navigate('/wallet/activity')}>
      Activity
    </button>
  )
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  wallet.activeId = 'test-wallet'
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(() => root.unmount())
  container.remove()
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function mount(path: string) {
  window.history.replaceState(null, '', `/index.html#${path}`)
  await act(() =>
    root.render(
      <HashRouter useTransitions={false}>
        <Navigation />
        <Router />
      </HashRouter>
    )
  )
}

describe('desktop wallet hash navigation', () => {
  it.each(['overview', 'activity', 'addresses'])('opens a nested %s deep link', async (page) => {
    await mount(`/wallet/${page}`)
    expect(container.querySelector(`[data-page="${page}"]`)).not.toBeNull()
    expect(window.location.pathname).toBe('/index.html')
  })

  it('navigates without changing the document path and restores history', async () => {
    await mount('/wallet/overview')
    await act(() => container.querySelector<HTMLButtonElement>('[data-nav]')?.click())
    expect(window.location.hash).toBe('#/wallet/activity')
    expect(window.location.pathname).toBe('/index.html')
    expect(container.querySelector('[data-page="activity"]')).not.toBeNull()
    await act(
      () =>
        new Promise<void>((resolve) => {
          window.addEventListener('popstate', () => resolve(), { once: true })
          window.history.back()
        })
    )
    expect(container.querySelector('[data-page="overview"]')).not.toBeNull()
  })

  it.each([
    ['create', 'words', 'check-intro'],
    ['import', 'import', 'create']
  ])('preserves the %s wizard next/back and exit navigation', async (flow, first, second) => {
    await mount(`/${flow}/0`)
    expect(container.querySelector(`[data-page="${first}"]`)).not.toBeNull()
    const click = async (text: string) =>
      act(() =>
        Array.from(container.querySelectorAll('button'))
          .find((b) => b.textContent === text)
          ?.click()
      )
    await click('Next')
    expect(window.location.hash).toBe(`#/${flow}/1`)
    expect(container.querySelector(`[data-page="${second}"]`)).not.toBeNull()
    await click('Back')
    expect(window.location.hash).toBe(`#/${flow}/0`)
    await click('Back')
    expect(container.querySelector('[data-page="welcome"]')).not.toBeNull()
  })

  it('redirects a locked wallet deep link to welcome', async () => {
    wallet.activeId = undefined
    await mount('/wallet/overview')
    expect(window.location.hash).toBe('#/')
    expect(container.querySelector('[data-page="welcome"]')).not.toBeNull()
  })

  it('opens the ledger connection route', async () => {
    await mount('/ledger')
    expect(container.querySelector('[data-page="ledger"]')).not.toBeNull()
  })
})
