import { BinaryIcon, Trash2 } from 'lucide-react'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'
import Logo from '@/components/Logo'
import { Section } from '@/components/PageComponents/PageContainers'
import Table, { TableRow } from '@/components/Table'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import CenteredModal from '@/modals/CenteredModal'
import { cleanUrl } from '@/utils/misc'

const WalletConnectModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { pairWithDapp, unpairFromDapp, activeSessions } = useWalletConnectContext()

  const [uri, setUri] = useState('')

  const handleConnect = () => {
    pairWithDapp(uri)
    setUri('')
  }

  return (
    <CenteredModal
      title="WalletConnect"
      subtitle={t(activeSessions.length > 0 ? 'Active dApp connections' : 'Connect to a dApp')}
      id={id}
    >
      {activeSessions.length > 0 && (
        <Section>
          <Table>
            {activeSessions.map(({ topic, peer: { metadata } }) => (
              <TableRow key={topic} role="row" tabIndex={0}>
                <Row>
                  <div style={{ width: 35 }}>
                    {metadata.icons[0] ? (
                      <Logo image={metadata.icons[0]} size={35} />
                    ) : (
                      <BinaryIcon size={35} color={theme.font.secondary} />
                    )}
                  </div>
                  {cleanUrl(metadata.url)}
                  <Button
                    onClick={() => unpairFromDapp(topic)}
                    Icon={Trash2}
                    circle
                    role="secondary"
                    style={{ marginLeft: 'auto' }}
                  />
                </Row>
              </TableRow>
            ))}
          </Table>
        </Section>
      )}
      <Section>
        <Row>
          <Input
            onChange={(t) => setUri(t.target.value)}
            value={uri}
            label={t('Paste WalletConnect URI copied from the dApp')}
            heightSize="big"
          />
          <ConnectButton onClick={handleConnect} disabled={uri === ''}>
            {t('Connect')}
          </ConnectButton>
        </Row>
      </Section>
    </CenteredModal>
  )
})
export default WalletConnectModal

const Row = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 15px;
  width: 100%;
`

const ConnectButton = styled(Button)`
  width: auto;
  padding: 0 26px;
`
