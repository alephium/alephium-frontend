import { dangerouslyConvertUint8ArrayMnemonicToString, decryptMnemonic } from '@alephium/keyring'
import { resetArray } from '@alephium/shared'
import { encrypt } from '@alephium/shared-crypto'
import { ScanLine } from 'lucide-react'
import { dataToFrames } from 'qrloop'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import QRCodeLoop, { QRCodeLoopProps } from '@/features/walletExport/qrCodeExport/QRCodeLoop'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'
import CenteredModal from '@/modals/CenteredModal'
import { selectAllContacts } from '@/storage/addresses/addressesSelectors'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'

const WalletQRCodeExportModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const addresses = useUnsortedAddresses()
  const contacts = useAppSelector(selectAllContacts)

  const [frames, setFrames] = useState<QRCodeLoopProps['frames']>([])

  if (!activeWalletId) return null

  const handleCorrectPasswordEntered = async (password: string) => {
    try {
      const { decryptedMnemonic } = await decryptMnemonic(walletStorage.load(activeWalletId).encrypted, password)
      const encryptedData = encrypt(
        password,
        JSON.stringify({
          mnemonic: dangerouslyConvertUint8ArrayMnemonicToString(decryptedMnemonic),
          addresses: addresses.map(({ index, label, color, isDefault }) => ({ index, label, color, isDefault })),
          contacts: contacts.map(({ name, address }) => ({ name, address }))
        }),
        'sha512'
      )

      resetArray(decryptedMnemonic)
      setFrames(dataToFrames(encryptedData, 160, 4))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <CenteredModal
      title={t('Export wallet')}
      id={id}
      focusMode
      narrow={frames.length === 0}
      skipFocusOnMount
      hasFooterButtons
      dynamicContent
    >
      {frames.length === 0 ? (
        <PasswordConfirmation
          text={t('Type your password to export your wallet.')}
          buttonText={t('Show QR code')}
          onCorrectPasswordEntered={handleCorrectPasswordEntered}
        />
      ) : (
        <Section>
          <InfoBox
            text={t('Scan this animated QR code with your mobile wallet.')}
            Icon={ScanLine}
            importance="accent"
          />
          <QRCodeLoop frames={frames} />
        </Section>
      )}
    </CenteredModal>
  )
})

export default WalletQRCodeExportModal
