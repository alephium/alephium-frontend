import { BinaryIcon, Trash2 } from 'lucide-react'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
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
      hasFooterButtons
    >
      {activeSessions.length > 0 && (
        <Box hasVerticalPadding hasHorizontalPadding hasBg>
          <Table>
            {activeSessions.map(({ topic, peer: { metadata } }, index) => (
              <TableRowStyled key={topic} role="row" tabIndex={0}>
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
                {index !== activeSessions.length - 1 && <HorizontalDividerStyled />}
              </TableRowStyled>
            ))}
          </Table>
        </Box>
      )}
      <SectionStyled align="flex-start">
        <Label>{t('Paste WalletConnect URI copied from the dApp')}</Label>
        <Row>
          <Input onChange={(t) => setUri(t.target.value)} value={uri} label="WalletConnect URI" heightSize="big" />
          <ConnectButton onClick={handleConnect} disabled={uri === ''}>
            {t('Connect')}
          </ConnectButton>
        </Row>
      </SectionStyled>
    </CenteredModal>
  )
})

export default WalletConnectModal

const TableRowStyled = styled(TableRow)`
  flex-direction: column;
`

const HorizontalDividerStyled = styled(HorizontalDivider)`
  margin: var(--spacing-2) 0;
`

const SectionStyled = styled(Section)`
  margin: var(--spacing-4) 0 var(--spacing-2) 0;
`

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

const Label = styled.label`
  color: ${({ theme }) => theme.font.secondary};
  text-align: left;
`
