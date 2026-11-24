import { act, ReactNode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { BrowserRouter, HashRouter, Link, useLocation, useParams } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'

const hosting = vi.hoisted(() => ({ isHostGhPages: false }))
vi.mock('@/index', () => hosting)
vi.mock('@alephium/shared/store', () => ({ networkPresetSwitched: vi.fn() }))
vi.mock('@alephium/shared-react', () => ({ useInitializeThrottledClient: vi.fn() }))
vi.mock('@/api/getNetworkSettings', () => ({ getNetworkSettings: () => ({ netType: 'mainnet' }) }))
vi.mock('@/hooks/redux', () => ({ useAppDispatch: () => dispatch }))
vi.mock('@/contexts/settingsContext', () => ({ useSettings: () => ({ theme: 'light' }) }))
vi.mock('@tanstack/react-query-persist-client', () => ({ PersistQueryClientProvider: PassThrough }))
vi.mock('@tanstack/query-sync-storage-persister', () => ({ createSyncStoragePersister: vi.fn() }))
vi.mock('@/api/queryClient', () => ({ queryClient: {} }))
vi.mock('@/contexts/staticDataContext', () => ({ StaticDataProvider: PassThrough }))
vi.mock('@/components/Snackbar/SnackbarProvider', () => ({ SnackbarProvider: PassThrough }))
vi.mock('@/styles/globalStyles', () => ({ default: () => null, deviceBreakPoints: { tablet: '(max-width: 800px)' } }))
vi.mock('@/components/AppFooter', () => ({ default: () => null }))
vi.mock('@/components/Tooltips', () => ({ default: () => null }))
vi.mock('@/components/AppHeader', () => ({
  default: () => <Link to="/transactions/tx123?p=2">Transaction</Link>
}))
vi.mock('@/pages/HomePage/HomePage', () => ({ default: () => <div data-page="home" /> }))
vi.mock('@/pages/BlockInfoPage', () => ({ default: () => <Page name="block" /> }))
vi.mock('@/pages/AddressInfoPage', () => ({ default: () => <Page name="address" /> }))
vi.mock('@/pages/TransactionInfoPage', () => ({ default: () => <Page name="transaction" /> }))
vi.mock('@/pages/404', () => ({ default: () => <div data-page="missing" /> }))

const dispatch = vi.fn()

function PassThrough({ children }: { children: ReactNode }) {
  return children
}

function Page({ name }: { name: string }) {
  const { id } = useParams()
  const { search } = useLocation()
  return <div data-page={name}>{`${id}${search}`}</div>
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
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

async function mount(url: string, hash: boolean) {
  hosting.isHostGhPages = hash
  window.history.replaceState(null, '', url)
  const Router = hash ? HashRouter : BrowserRouter
  await act(() =>
    root.render(
      <Router>
        <App />
      </Router>
    )
  )
}

describe.each([false, true])('explorer navigation (hash hosting: %s)', (hash) => {
  const url = (path: string) => (hash ? `/explorer/#${path}` : path)

  it.each(['blocks', 'addresses', 'transactions'])('opens a %s deep link with query parameters', async (resource) => {
    await mount(url(`/${resource}/abc123?p=3`), hash)
    expect(container.querySelector('[data-page]')?.textContent).toBe('abc123?p=3')
  })

  it('navigates through a link and browser back/forward, then survives remount', async () => {
    await mount(url('/blocks/block123'), hash)
    await act(() => container.querySelector('a')?.click())
    expect(container.querySelector('[data-page="transaction"]')?.textContent).toBe('tx123?p=2')
    await act(
      () =>
        new Promise<void>((resolve) => {
          window.addEventListener('popstate', () => resolve(), { once: true })
          window.history.back()
        })
    )
    expect(container.querySelector('[data-page="block"]')).not.toBeNull()
    await act(
      () =>
        new Promise<void>((resolve) => {
          window.addEventListener('popstate', () => resolve(), { once: true })
          window.history.forward()
        })
    )
    expect(container.querySelector('[data-page="transaction"]')).not.toBeNull()
    await act(() => root.unmount())
    root = createRoot(container)
    await mount(window.location.href, hash)
    expect(container.querySelector('[data-page="transaction"]')?.textContent).toBe('tx123?p=2')
  })

  it('keeps the home and not-found routes', async () => {
    await mount(url('/'), hash)
    expect(container.querySelector('[data-page="home"]')).not.toBeNull()
    await act(() => root.unmount())
    root = createRoot(container)
    await mount(url('/not-a-route'), hash)
    expect(container.querySelector('[data-page="missing"]')).not.toBeNull()
  })
})

it('converts a legacy hash deep link on browser-router hosting', async () => {
  await mount('/#/addresses/legacy?p=4', false)
  expect(window.location.pathname).toBe('/addresses/legacy')
  expect(window.location.search).toBe('?p=4')
  expect(window.location.hash).toBe('')
  expect(container.querySelector('[data-page="address"]')?.textContent).toBe('legacy?p=4')
})
