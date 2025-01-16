import { Route, Routes } from 'react-router-dom'

import ConnectLedgerInstructionsPage from '@/features/ledger/ConnectLedgerInstructionsPage'
import HomePage from '@/pages/HomePage'
import CheckWordsIntroPage from '@/pages/NewWallet/CheckWordsIntroPage'
import CheckWordsPage from '@/pages/NewWallet/CheckWordsPage'
import CreateWalletPage from '@/pages/NewWallet/CreateWalletPage'
import ImportWordsPage from '@/pages/NewWallet/ImportWordsPage'
import NewWalletLayout from '@/pages/NewWallet/NewWalletLayout'
import WalletWelcomePage from '@/pages/NewWallet/WalletWelcomePage'
import WalletWordsPage from '@/pages/NewWallet/WalletWordsPage'
import UnlockedWalletRoutes from '@/routes/UnlockedWalletRoutes'

const createWalletSteps = [
  <WalletWordsPage key="wallet-words" />,
  <CheckWordsIntroPage key="check-words-intro" />,
  <CheckWordsPage key="check-words" />,
  <CreateWalletPage key="create-wallet" />,
  <WalletWelcomePage key="welcome" />
]
const importWalletSteps = [
  <ImportWordsPage key="import-words" />,
  <CreateWalletPage key="create-wallet" isRestoring />,
  <WalletWelcomePage key="welcome" />
]

const Router = () => (
  <Routes>
    <Route path="/create/:step" element={<NewWalletLayout baseUrl="create" steps={createWalletSteps} />} />
    <Route path="/import/:step" element={<NewWalletLayout baseUrl="import" steps={importWalletSteps} />} />
    <Route path="/wallet/*" element={<UnlockedWalletRoutes />} />
    <Route path="/ledger" element={<ConnectLedgerInstructionsPage />} />
    <Route path="" element={<HomePage />} />
  </Routes>
)

export default Router
