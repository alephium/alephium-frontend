import '@/features/localization/i18n'

import { throttledClient } from '@alephium/shared/api'
import { explorerApiClientInitSucceeded, sharedReducer } from '@alephium/shared/store'
import { queryClient } from '@alephium/shared-react'
import { explorer as e, ExplorerProvider } from '@alephium/web3'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import { lightTheme } from '@/features/theme/themes'
import TransactionDetailsModal from '@/features/transactionsDisplay/transactionDetailsModal/TransactionDetailsModal'

// Keep the real modal status, shared transaction hook, query cache and Redux selectors. The shell and unrelated
// transaction sections do not participate in refreshing the displayed status.
vi.mock('@/modals/SideModal', () => ({
  default: ({ children }: { children: ReactNode }) => <div role="dialog">{children}</div>,
  SideModalTitle: 'div'
}))

vi.mock('@/components/Amount', () => ({ default: () => null }))
vi.mock('@/components/HashEllipsed', () => ({ default: ({ hash }: { hash: string }) => <span>{hash}</span> }))
vi.mock('@/components/Tooltip', () => ({ default: () => null }))
vi.mock('@/features/transactionsDisplay/TransactionSummary', () => ({ default: () => null }))
vi.mock('@/features/transactionsDisplay/transactionDetailsModal/AddressesDataRows', () => ({ default: () => null }))
vi.mock('@/features/transactionsDisplay/transactionDetailsModal/GasUTXOsExpandableSection', () => ({
  default: () => null
}))
vi.mock('@/features/transactionsDisplay/transactionDetailsModal/LockTimeDataListRow', () => ({ default: () => null }))

const TX_HASH = 'transaction-being-indexed'
const ADDRESS = 'wallet-address'

const pendingTx: e.PendingTransaction = {
  hash: TX_HASH,
  chainFrom: 0,
  chainTo: 0,
  inputs: [{ address: ADDRESS, outputRef: { hint: 0, key: 'previous-output' }, contractInput: false }],
  outputs: [],
  gasAmount: 20000,
  gasPrice: '100000000000',
  lastSeen: 1,
  type: 'pending'
}

const acceptedTx = (scriptExecutionOk: boolean): e.AcceptedTransaction => ({
  ...pendingTx,
  type: 'confirmed',
  blockHash: 'confirmed-block',
  timestamp: 1700000000000,
  inputs: pendingTx.inputs?.map((input) => ({ ...input, txHashRef: 'previous-transaction' })),
  version: 0,
  networkId: 0,
  coinbase: false,
  scriptExecutionOk
})

const renderModal = () => {
  const store = configureStore({ reducer: sharedReducer })
  store.dispatch(explorerApiClientInitSucceeded())

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={lightTheme}>
          <TransactionDetailsModal id={1} txHash={TX_HASH} referenceAddress={ADDRESS} />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}

describe('TransactionDetailsModal status refresh', () => {
  beforeEach(() => {
    queryClient.clear()
    // Advance query polling without replacing the timeout-based React Query notifications or waitFor retries.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
  })

  afterEach(() => {
    cleanup()
    queryClient.clear()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it.each([
    { scriptExecutionOk: true, status: 'Confirmed' },
    { scriptExecutionOk: false, status: 'Script execution failed' }
  ])('updates an open pending modal to "$status" and stops polling', async ({ scriptExecutionOk, status }) => {
    let explorerTx: e.PendingTransaction | e.AcceptedTransaction = pendingTx
    const getTransactionsTransactionHash = vi.fn(async () => explorerTx)

    vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue({
      transactions: { getTransactionsTransactionHash }
    } as unknown as ExplorerProvider)

    renderModal()

    const dialog = screen.getByRole('dialog')
    await waitFor(() => expect(within(dialog).getByText('Pending')).toBeInTheDocument())
    expect(within(dialog).queryByText('Timestamp')).not.toBeInTheDocument()

    explorerTx = acceptedTx(scriptExecutionOk)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    await waitFor(() => expect(within(dialog).getByText(status)).toBeInTheDocument())
    expect(screen.getByRole('dialog')).toBe(dialog)
    expect(within(dialog).queryByText('Pending')).not.toBeInTheDocument()
    expect(within(dialog).getByText('Timestamp')).toBeInTheDocument()

    const requestsAfterConfirmation = getTransactionsTransactionHash.mock.calls.length

    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000)
    })

    expect(getTransactionsTransactionHash).toHaveBeenCalledTimes(requestsAfterConfirmation)
    expect(within(dialog).getByText(status)).toBeInTheDocument()
  })
})
