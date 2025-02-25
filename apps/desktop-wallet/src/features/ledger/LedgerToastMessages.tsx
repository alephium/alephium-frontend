import LedgerAddressDiscoveryToastBox from '@/features/ledger/LedgerAddressDiscoveryToastBox'
import { useAppSelector } from '@/hooks/redux'

const LedgerToastMessages = () => {
  const isNewLedgerDevice = useAppSelector((s) => s.ledger.isNewDevice)

  if (!isNewLedgerDevice) return null

  return <LedgerAddressDiscoveryToastBox />
}

export default LedgerToastMessages
