import '@/features/localization/i18n'

import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import LedgerGrouplessRecipientWarning from '@/features/ledger/LedgerGrouplessRecipientWarning'
import { lightTheme } from '@/features/theme/themes'
import { openInWebBrowser } from '@/utils/misc'

const GROUPLESS_ADDRESS = '3cUtFAR5kbr2EBgvh2tKqgjsqysEKmEwzMsW3yJL8e9BiqZ4dsyhH'
const GROUPED_ADDRESS = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'

const wallet = { isLedger: true }

vi.mock('@/features/ledger/useLedger', () => ({
  useLedger: () => ({ isLedger: wallet.isLedger, onLedgerError: vi.fn() })
}))

vi.mock('@/utils/misc', () => ({ openInWebBrowser: vi.fn() }))

const renderWarning = (toAddress: string) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <LedgerGrouplessRecipientWarning toAddress={toAddress} />
    </ThemeProvider>
  )

const warning = () => screen.queryByText(/not supported by the Alephium Ledger app/)

describe('LedgerGrouplessRecipientWarning', () => {
  beforeEach(() => {
    wallet.isLedger = true
    vi.mocked(openInWebBrowser).mockClear()
  })

  it('warns a Ledger user about a groupless recipient', () => {
    renderWarning(GROUPLESS_ADDRESS)

    expect(warning()).toBeInTheDocument()
  })

  it('points at the issue tracking the missing support', () => {
    renderWarning(GROUPLESS_ADDRESS)

    fireEvent.click(screen.getByText('on GitHub'))

    expect(openInWebBrowser).toHaveBeenCalledWith('https://github.com/alephium/ledger-alephium/issues/40')
  })

  it('stays out of the way for a recipient the Ledger app can sign for', () => {
    renderWarning(GROUPED_ADDRESS)

    expect(warning()).not.toBeInTheDocument()
  })

  it('stays out of the way when the wallet is not a Ledger one', () => {
    wallet.isLedger = false
    renderWarning(GROUPLESS_ADDRESS)

    expect(warning()).not.toBeInTheDocument()
  })

  it('survives an address that is still being typed', () => {
    expect(() => renderWarning(GROUPLESS_ADDRESS.slice(0, 12))).not.toThrow()
    expect(warning()).not.toBeInTheDocument()
  })
})
