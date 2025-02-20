import { dangerouslyConvertUint8ArrayMnemonicToString, decryptMnemonic } from '@alephium/keyring'
import { resetArray } from '@alephium/shared'
import { encrypt } from '@alephium/shared-crypto'
import { ScanLine } from 'lucide-react'
import { dataToFrames } from 'qrloop'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'
import CenteredModal from '@/modals/CenteredModal'
import { selectAllContacts } from '@/storage/addresses/addressesSelectors'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'

// Inspired by:
// - https://github.com/LedgerHQ/ledger-live/blob/edc7cc4091969564f8fe295ff2bf0a3e425a4ba6/apps/ledger-live-desktop/src/renderer/components/Exporter/QRCodeExporter.tsx
// - https://github.com/gre/qrloop/blob/06eaa7fd23bd27e0c638b1c66666cada1bbd0d30/examples/web-text-exporter

const FPS = 5

const WalletQRCodeExportModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const addresses = useUnsortedAddresses()
  const contacts = useAppSelector(selectAllContacts)

  const [frames, setFrames] = useState<string[]>([])
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    let lastT: number
    let requestedAnimationFrame: number

    const loop = (t: number) => {
      requestedAnimationFrame = requestAnimationFrame(loop)

      if (!lastT) lastT = t

      if ((t - lastT) * FPS < 1000) return

      lastT = t

      setFrame((frame: number) => (frames.length > 0 ? (frame + 1) % frames.length : 0))
    }

    requestedAnimationFrame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(requestedAnimationFrame)
    }
  }, [frames.length])

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
    <CenteredModal title={t('Export wallet')} id={id} focusMode narrow={frames.length === 0} skipFocusOnMount>
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
          <QRCodeLoop>
            {frames.map((data, i) => (
              <div key={i} style={{ position: 'absolute', opacity: i === frame ? 1 : 0 }}>
                <QRCode size={400} value={data} bgColor={theme.bg.primary} fgColor={theme.font.primary} />
              </div>
            ))}
          </QRCodeLoop>
        </Section>
      )}
    </CenteredModal>
  )
})

export default WalletQRCodeExportModal

const QRCodeLoop = styled.div`
  position: relative;
  height: 460px;
  width: 100%;
  display: flex;
  justify-content: center;
`
