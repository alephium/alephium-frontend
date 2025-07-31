import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Select, { SelectOption } from '@/components/Inputs/Select'
import { useLedger } from '@/features/ledger/useLedger'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { StoredEncryptedWallet } from '@/types/wallet'

interface WalletSelectProps {
  onSelect: () => void
}

const WalletSelect = ({ onSelect }: WalletSelectProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const wallets = useAppSelector((s) => s.global.wallets)
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)
  const { isLedger } = useLedger()

  const [selectedWalletOption, setSelectedWalletOption] = useState<SelectOption<string>>()

  const walletSelectOptions: SelectOption<string>[] = useMemo(
    () => wallets.map((wallet) => ({ value: wallet.id, label: wallet.name })),
    [wallets]
  )

  useEffect(() => {
    setSelectedWalletOption(
      isLedger && activeWalletId && activeWalletName
        ? { value: activeWalletId, label: activeWalletName }
        : walletSelectOptions.find((wallet) => wallet.value === activeWalletId)
    )
  }, [activeWalletId, activeWalletName, isLedger, walletSelectOptions, wallets])

  const handleWalletSelect = (walletId: StoredEncryptedWallet['id']) => {
    setSelectedWalletOption(walletSelectOptions.find((wallet) => wallet.value === walletId))
    dispatch(openModal({ name: 'WalletUnlockModal', props: { walletId } }))
    onSelect()
  }

  return (
    <Select
      label={t('Current wallet')}
      controlledValue={selectedWalletOption}
      options={walletSelectOptions}
      onSelect={handleWalletSelect}
      title={t('Select a wallet')}
      id="wallet"
      raised
      skipEqualityCheck
      allowReselectionOnClickWhenSingleOption
      allowCustomValue={isLedger}
    />
  )
}

export default WalletSelect
