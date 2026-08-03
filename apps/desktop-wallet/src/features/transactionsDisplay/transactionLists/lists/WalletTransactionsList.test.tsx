import '@/features/localization/i18n'

import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import { lightTheme } from '@/features/theme/themes'
import WalletTransactionsList from '@/features/transactionsDisplay/transactionLists/lists/WalletTransactionsList'

const refresh = vi.fn()

const listState = {
  data: [],
  isLoading: false,
  isFetching: false,
  hasNextPage: false,
  fetchNextPage: vi.fn(),
  isFetchingNextPage: false,
  pagesLoaded: 1,
  refresh,
  showNewTxsMessage: false
}

vi.mock('@alephium/shared-react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@alephium/shared-react')>()),
  useFetchWalletTransactionsInfinite: () => listState,
  useUnsortedAddressesHashes: () => [],
  useIsExplorerOffline: () => false
}))

const renderList = () =>
  render(
    <Provider store={configureStore({ reducer: () => ({ settings: { region: 'en-US' } }) })}>
      <ThemeProvider theme={lightTheme}>
        <WalletTransactionsList />
      </ThemeProvider>
    </Provider>
  )

describe('WalletTransactionsList', () => {
  beforeEach(() => {
    refresh.mockClear()
    listState.showNewTxsMessage = false
  })

  it('does not offer to display new transactions while the list is up to date', () => {
    renderList()

    expect(screen.queryByText('Click to display new transactions')).not.toBeInTheDocument()
  })

  it('pulls the new transactions in only once the user asks for them', () => {
    listState.showNewTxsMessage = true
    renderList()

    const button = screen.getByText('Click to display new transactions')
    expect(refresh).not.toHaveBeenCalled()

    fireEvent.click(button)

    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
