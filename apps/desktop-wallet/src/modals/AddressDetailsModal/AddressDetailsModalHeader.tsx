import { selectAddressByHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import HashEllipsed from '@/components/HashEllipsed'
import { useLedger } from '@/features/ledger/useLedger'
import { AddressModalBaseProp } from '@/features/modals/modalTypes'
import { useAppSelector } from '@/hooks/redux'
import { openInWebBrowser } from '@/utils/misc'

const Header = ({ addressHash }: AddressModalBaseProp) => {
  const { t } = useTranslation()
  const explorerUrl = useAppSelector((s) => s.network.settings.explorerUrl)

  const handleExplorerLinkClick = () => openInWebBrowser(`${explorerUrl}/addresses/${addressHash}`)

  return (
    <HeaderStyled>
      <LeftSide>
        <AddressColorIndicator addressHash={addressHash} size={15} />
        <TitleBadge addressHash={addressHash} />
      </LeftSide>
      <ExplorerButton role="secondary" transparent short onClick={handleExplorerLinkClick}>
        {t('Show in explorer')} ↗
      </ExplorerButton>
    </HeaderStyled>
  )
}

export default Header

const TitleBadge = ({ addressHash }: AddressModalBaseProp) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const { isLedger } = useLedger()

  if (!address) return null

  return (
    <>
      <Title>
        <AddressBadgeStyled
          addressHash={addressHash}
          hideColorIndication
          disableCopy={!!address.label}
          truncate
          hashWidth={110}
        />
        {address.label && <TitleAddressHash hash={addressHash} />}
      </Title>
      {isLedger && (
        <Badge short color={theme.font.tertiary}>
          {t('Group')} {address.group}
        </Badge>
      )}
    </>
  )
}

const HeaderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const LeftSide = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`

const ExplorerButton = styled(Button)`
  width: auto;
`

const AddressBadgeStyled = styled(AddressBadge)`
  font-size: 15px;
`

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const TitleAddressHash = styled(HashEllipsed)`
  max-width: 100px;
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
`
