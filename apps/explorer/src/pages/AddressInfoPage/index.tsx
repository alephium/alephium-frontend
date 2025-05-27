import { addApostrophes, calculateTokenAmountWorth, getHumanReadableError } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import {
  contractIdFromAddress,
  groupOfAddress,
  isGrouplessAddressWithGroupIndex,
  isGrouplessAddressWithoutGroupIndex,
  isValidAddress
} from '@alephium/web3'
import { MempoolTransaction } from '@alephium/web3/dist/src/api/api-explorer'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import QRCode from 'qrcode.react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiFileDownloadLine } from 'react-icons/ri'
import { usePageVisibility } from 'react-page-visibility'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import { queries } from '@/api'
import { useAssetsMetadata, useTokensPrices } from '@/api/assets/assetsHooks'
import client from '@/api/client'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import Button from '@/components/Buttons/Button'
import TimestampExpandButton from '@/components/Buttons/TimestampExpandButton'
import HighlightedHash from '@/components/HighlightedHash'
import Menu from '@/components/Menu'
import PageSwitch from '@/components/PageSwitch'
import Section from '@/components/Section'
import SectionTitle from '@/components/SectionTitle'
import Table, { TDStyle } from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import TableHeader from '@/components/Table/TableHeader'
import Timestamp from '@/components/Timestamp'
import usePageNumber from '@/hooks/usePageNumber'
import { useSnackbar } from '@/hooks/useSnackbar'
import ModalPortal from '@/modals/ModalPortal'
import AddressTransactionRow from '@/pages/AddressInfoPage/AddressTransactionRow'
import AssetList from '@/pages/AddressInfoPage/AssetList'
import ExportAddressTXsModal from '@/pages/AddressInfoPage/ExportAddressTXsModal'
import AddressInfoGrid from '@/pages/AddressInfoPage/InfoGrid'
import { deviceBreakPoints } from '@/styles/globalStyles'

type ParamTypes = {
  id: string
}

const numberOfTxsPerPage = 10

const AddressInfoPage = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { id } = useParams<ParamTypes>()
  const isAppVisible = usePageVisibility()
  const pageNumber = usePageNumber()
  const { displaySnackbar } = useSnackbar()
  const navigate = useNavigate()

  const [exportModalShown, setExportModalShown] = useState(false)

  const lastKnownMempoolTxs = useRef<MempoolTransaction[]>([])

  const addressHash = id && isValidAddress(id) ? id : ''

  const { data: addressBalance } = useQuery({
    ...queries.address.balance.details(addressHash),
    enabled: !!addressHash
  })

  const {
    data: txList,
    isLoading: txListLoading,
    refetch: refetchTxList
  } = useQuery({
    ...queries.address.transactions.confirmed(addressHash, pageNumber, numberOfTxsPerPage),
    enabled: !!addressHash,
    placeholderData: keepPreviousData
  })

  const { data: latestTransaction } = useQuery({
    ...queries.address.transactions.confirmed(addressHash, 1, 1),
    enabled: !!addressHash
  })

  const { data: addressMempoolTransactions = [] } = useQuery({
    ...queries.address.transactions.mempool(addressHash),
    enabled: !!addressHash,
    refetchInterval: isAppVisible && pageNumber === 1 ? 10000 : undefined
  })

  const { data: txNumber, isLoading: txNumberLoading } = useQuery({
    ...queries.address.transactions.txNumber(addressHash),
    enabled: !!addressHash
  })

  const { data: tokenBalances = [] } = useQuery({
    ...queries.address.assets.tokensBalance(addressHash),
    enabled: !!addressHash
  })

  const { fungibleTokens: fungibleTokensMetadata } = useAssetsMetadata(tokenBalances.map((b) => b.tokenId))

  // Refetch TXs when less txs are found in mempool
  useEffect(() => {
    if (addressMempoolTransactions.length < lastKnownMempoolTxs.current.length) {
      refetchTxList()
    }
    lastKnownMempoolTxs.current = addressMempoolTransactions
  }, [addressMempoolTransactions, refetchTxList])

  const tokensPrices = useTokensPrices([ALPH.symbol, ...fungibleTokensMetadata.map((t) => t.symbol)])

  if (!addressHash) {
    displaySnackbar({ text: t('The address format seems invalid'), type: 'alert' })
    navigate('/404')
    return null
  }

  const addressWithoutGroup = addressHash.split(':')[0]

  const isGrouplessAddress = isGrouplessAddressWithoutGroupIndex(addressHash)
  const isGroupedAddress = isGrouplessAddressWithGroupIndex(addressHash)

  const knownTokensWorth = tokenBalances.reduce((acc, b) => {
    const token = fungibleTokensMetadata.find((t) => t.verified && t.id === b.tokenId)

    if (!token) return acc

    const price = tokensPrices[token.symbol] || 0

    return acc + calculateTokenAmountWorth(BigInt(b.balance), price, token.decimals)
  }, 0)

  const addressLatestActivity =
    latestTransaction && latestTransaction.length > 0 ? latestTransaction[0].timestamp : undefined

  const totalBalance = addressBalance?.balance
  const lockedBalance = addressBalance?.lockedBalance

  const addressWorth =
    knownTokensWorth +
    (totalBalance
      ? calculateTokenAmountWorth(BigInt(totalBalance), tokensPrices[ALPH.symbol] || NaN, ALPH.decimals)
      : 0)

  const totalNbOfAssets =
    tokenBalances.length +
    ((totalBalance && BigInt(totalBalance) > 0) || (lockedBalance && BigInt(lockedBalance) > 0) ? 1 : 0)

  const handleExportModalOpen = () => setExportModalShown(true)
  const handleExportModalClose = () => setExportModalShown(false)

  let addressGroup

  try {
    addressGroup = groupOfAddress(addressHash)
  } catch (e) {
    console.log(e)

    displaySnackbar({
      text: getHumanReadableError(e, t('Could not get the group of this address')),
      type: 'alert'
    })
  }

  let isContract = false

  try {
    isContract = !!contractIdFromAddress(addressHash)
  } catch (e) {
    isContract = false
  }

  return (
    <Section>
      <SectionTitle
        title={isContract ? t('Contract') : t('Addresses_one')}
        subtitle={<HighlightedHash text={addressHash} textToCopy={addressHash} />}
      />
      <InfoGridAndQR>
        <InfoGrid>
          <InfoGrid.Cell
            label={t('ALPH balance')}
            value={totalBalance && <Amount assetId={ALPH.id} value={BigInt(totalBalance)} />}
            sublabel={
              lockedBalance &&
              lockedBalance !== '0' && (
                <Badge
                  content={
                    <span>
                      {t('Locked')}: <Amount assetId={ALPH.id} value={BigInt(lockedBalance)} />
                    </span>
                  }
                  type="neutral"
                />
              )
            }
          />
          <InfoGrid.Cell
            label={t('Address worth')}
            value={addressWorth && <Amount value={addressWorth} isFiat suffix="$" />}
            sublabel={client.networkType === 'testnet' && t('Worth of mainnet equivalent')}
          />
          <InfoGrid.Cell
            label={t('Nb. of transactions')}
            value={txNumber ? addApostrophes(txNumber.toFixed(0)) : !txNumberLoading ? 0 : undefined}
          />
          <InfoGrid.Cell label={t('Nb. of assets')} value={totalNbOfAssets} />
          <InfoGrid.Cell
            label={t('Group(s)')}
            value={
              isGrouplessAddress || isGroupedAddress ? (
                <GroupMenu
                  label={isGrouplessAddress ? t('All') : `${t('Group')} ${addressGroup?.toString() || ''}`}
                  items={[
                    {
                      text: t('All'),
                      onClick: () => {
                        navigate(`/addresses/${addressWithoutGroup}`)
                      }
                    },
                    {
                      text: t('Group {{ number }}', { number: 0 }),
                      onClick: () => {
                        navigate(`/addresses/${addressWithoutGroup}:0`)
                      }
                    },
                    {
                      text: t('Group {{ number }}', { number: 1 }),
                      onClick: () => {
                        navigate(`/addresses/${addressWithoutGroup}:1`)
                      }
                    },
                    {
                      text: t('Group {{ number }}', { number: 2 }),
                      onClick: () => {
                        navigate(`/addresses/${addressWithoutGroup}:2`)
                      }
                    },
                    {
                      text: t('Group {{ number }}', { number: 3 }),
                      onClick: () => {
                        navigate(`/addresses/${addressWithoutGroup}:3`)
                      }
                    }
                  ]}
                  direction="down"
                />
              ) : (
                addressGroup
              )
            }
          />
          <InfoGrid.Cell
            label={t('Latest activity')}
            value={
              addressLatestActivity ? (
                <Timestamp timeInMs={addressLatestActivity} forceFormat="low" />
              ) : !txListLoading ? (
                t('No activity yet')
              ) : undefined
            }
          />
        </InfoGrid>
        <QRCodeCell>
          <QRCode size={130} value={addressHash} bgColor="transparent" fgColor={theme.font.primary} />
        </QRCodeCell>
      </InfoGridAndQR>

      <SectionHeader>
        <h2>{t('Assets')}</h2>
      </SectionHeader>

      <AssetList addressBalance={addressBalance} addressHash={addressHash} />

      <SectionHeader>
        <h2>{t('Transactions')}</h2>
        {txNumber && txNumber > 0 ? (
          <Button onClick={handleExportModalOpen}>
            <RiFileDownloadLine size={16} />
            {t('Download CSV')}
          </Button>
        ) : null}
      </SectionHeader>

      <Table noBorder hasDetails main scrollable isLoading={txListLoading}>
        {(!txListLoading && txList?.length) || addressMempoolTransactions?.length ? (
          <>
            <TableHeader
              headerTitles={[
                <span key="hash-time">
                  {t('Hash & Time')}
                  <TimestampExpandButton />
                </span>,
                t('Type'),
                t('Assets'),
                '',
                t('Addresses_other'),
                t('Amounts'),
                ''
              ]}
              columnWidths={['20%', '25%', '20%', '80px', '25%', '150px', '30px']}
              textAlign={['left', 'left', 'left', 'left', 'left', 'right', 'left']}
            />
            <TableBody tdStyles={TxListCustomStyles}>
              {addressMempoolTransactions &&
                addressMempoolTransactions.map((t, i) => (
                  <AddressTransactionRow transaction={t} addressHash={addressHash} key={i} isInContract={isContract} />
                ))}
              {txList &&
                txList
                  .sort((t1, t2) => (t2.timestamp && t1.timestamp ? t2.timestamp - t1.timestamp : 1))
                  .map((t, i) => (
                    <AddressTransactionRow
                      transaction={t}
                      addressHash={addressHash}
                      key={i}
                      isInContract={isContract}
                    />
                  ))}
            </TableBody>
          </>
        ) : (
          <TableBody>
            <NoTxsMessage>
              <td>{t('No transactions yet')}</td>
            </NoTxsMessage>
          </TableBody>
        )}
      </Table>

      {txNumber ? <PageSwitch totalNumberOfElements={txNumber} elementsPerPage={numberOfTxsPerPage} /> : null}

      <ModalPortal>
        <ExportAddressTXsModal addressHash={addressHash} isOpen={exportModalShown} onClose={handleExportModalClose} />
      </ModalPortal>
    </Section>
  )
}

export default AddressInfoPage

const TxListCustomStyles: TDStyle[] = [
  {
    tdPos: 3,
    style: css`
      min-width: 100px;
    `
  },
  {
    tdPos: 6,
    style: css`
      text-align: right;
    `
  },
  {
    tdPos: 7,
    style: css`
      padding: 0;
    `
  }
]

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
`

const NoTxsMessage = styled.tr`
  color: ${({ theme }) => theme.font.secondary};
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 15px 20px;
`

const GroupMenu = styled(Menu)`
  border: 1px solid ${({ theme }) => theme.border.primary};
  width: fit-content;
  min-width: 120px;
  font-size: 17px;
  font-weight: 500;
`
