import { initializeViewOnlyAddress } from '@alephium/shared'
import { ApiContextProvider } from '@alephium/shared-react'
import QRCode from 'qrcode.react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Section from '@/components/Section'
import { useAppDispatch } from '@/hooks/redux'
import AssetList from '@/pages/AddressInfoPage/AssetList'
import AddressInfoGrid from '@/pages/AddressInfoPage/InfoGrid'
import AddressAlphBalances from '@/pages/AddressPage/AddressAlphBalances'
import AddressAssetsCount from '@/pages/AddressPage/AddressAssetsCount'
import AddressGroup from '@/pages/AddressPage/AddressGroup'
import AddressLatestActivity from '@/pages/AddressPage/AddressLatestActivity'
import AddressPageTitle from '@/pages/AddressPage/AddressPageTItle'
import AddressTransactions from '@/pages/AddressPage/AddressTransactions'
import AddressTransactionsCount from '@/pages/AddressPage/AddressTransactionsCount'
import AddressTransactionsExportButton from '@/pages/AddressPage/AddressTransactionsExportButton'
import AddressWorth from '@/pages/AddressPage/AddressWorth'
import { deviceBreakPoints } from '@/styles/globalStyles'

interface AddressPageProps {
  addressStr: string
}

const AddressPage = ({ addressStr }: AddressPageProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(initializeViewOnlyAddress(addressStr))
  }, [addressStr, dispatch])

  return (
    <ApiContextProvider>
      <Section>
        <AddressPageTitle addressStr={addressStr} />
        <InfoGridAndQR>
          <InfoGrid>
            <AddressAlphBalances addressStr={addressStr} />
            <AddressWorth addressStr={addressStr} />
            <AddressTransactionsCount addressStr={addressStr} />
            <AddressAssetsCount addressStr={addressStr} />
            <AddressGroup addressStr={addressStr} />
            <AddressLatestActivity addressStr={addressStr} />
          </InfoGrid>
          <QRCodeCell>
            <QRCode size={130} value={addressStr} bgColor="transparent" fgColor={theme.font.primary} />
          </QRCodeCell>
        </InfoGridAndQR>

        <SectionHeader>
          <h2>{t('Assets')}</h2>
        </SectionHeader>

        <AssetList addressStr={addressStr} />

        <SectionHeader>
          <h2>{t('Transactions')}</h2>
          <AddressTransactionsExportButton addressStr={addressStr} />
        </SectionHeader>

        <AddressTransactions addressStr={addressStr} />
      </Section>
    </ApiContextProvider>
  )
}

export default AddressPage

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 35px;
  margin-bottom: 10px;
`

const InfoGridAndQR = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border-radius: 8px;

  @media ${deviceBreakPoints.tablet} {
    flex-direction: column;
    height: auto;
  }
`

const InfoGrid = styled(AddressInfoGrid)`
  flex: 1;
`

const QRCodeCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 40px;
  margin-left: 5px;
  border-radius: 8px;

  @media ${deviceBreakPoints.tablet} {
    margin-left: 0;
    margin-top: 10px;
    padding: 20px;
  }
`
