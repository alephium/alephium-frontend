import { keyring } from '@alephium/keyring'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { WalletContextProvider } from '@/contexts/wallet'
import { lightTheme } from '@/features/theme/themes'
import WalletWordsPage from '@/pages/NewWallet/WalletWordsPage'

const sendAnalytics = vi.fn()

vi.mock('@/features/analytics/useAnalytics', () => ({
  default: () => ({ sendAnalytics })
}))

vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      changeLanguage: () => new Promise(() => null)
    }
  })
}))

const alreadyLoadedMnemonic =
  'pumpkin price lake liar into school cotton town trial kangaroo wrist trend work slab candy napkin today scene fun answer also bid garage lottery'

const renderWalletWordsPage = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <WalletContextProvider>
        <WalletWordsPage />
      </WalletContextProvider>
    </ThemeProvider>
  )

describe('WalletWordsPage', () => {
  beforeEach(() => {
    keyring.clear()
    sendAnalytics.mockClear()
  })

  afterAll(() => {
    keyring.clear()
    vi.clearAllMocks()
  })

  it('displays the words of a newly generated secret recovery phrase', () => {
    renderWalletWordsPage()

    expect(screen.getByText('Secret recovery phrase')).toBeInTheDocument()
    expect(screen.getByText('24.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "I've copied the words, continue" })).toBeInTheDocument()
    expect(sendAnalytics).not.toHaveBeenCalled()
  })

  it('displays the words of a newly generated secret recovery phrase when a wallet is already loaded in the keyring', () => {
    keyring.importMnemonicString(alreadyLoadedMnemonic)

    const { container } = renderWalletWordsPage()

    expect(screen.getByText('24.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "I've copied the words, continue" })).toBeInTheDocument()
    expect(sendAnalytics).not.toHaveBeenCalled()

    const alreadyLoadedWords = alreadyLoadedMnemonic
      .split(' ')
      .map((word, index) => `${index + 1}.${word}`)
      .join('')

    expect(container.textContent).not.toContain(alreadyLoadedWords)
  })
})
