/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { useSnackbar } from '@/hooks/useSnackbar'
import { AddressLink } from '@/components/Links'

import { addApostrophes, getHumanReadableError } from '@alephium/shared'
import { queries } from '@/api'
import { useAssetMetadata } from '@/api/assets/assetsHooks'
import { groupOfAddress } from '@alephium/web3'
import { addressFromTokenId } from '@alephium/web3'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import TimestampExpandButton from '@/components/Buttons/TimestampExpandButton'
import HighlightedHash from '@/components/HighlightedHash'
import PageSwitch from '@/components/PageSwitch'
import Section from '@/components/Section'
import SectionTitle from '@/components/SectionTitle'
import Table, { TDStyle } from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import TableHeader from '@/components/Table/TableHeader'
import Timestamp from '@/components/Timestamp'
import usePageNumber from '@/hooks/usePageNumber'
import AddressInfoGrid from '@/pages/AddressInfoPage/InfoGrid'
import TokenTransactionRow from '@/pages/TokenInfoPage/TokenTransactionRow'

type ParamTypes = {
  id: string
}

const numberOfTxsPerPage = 10

const TokenInfoPage = () => {
  const { displaySnackbar } = useSnackbar()
  const { t } = useTranslation()
  const { id } = useParams<ParamTypes>()
  const pageNumber = usePageNumber()

  const tokenHash = id ? id : ''

  const tokenAddress = addressFromTokenId(tokenHash)

  const assetMetadata = useAssetMetadata(tokenHash || '')

  const assetType = assetMetadata.type

  let name: string | undefined = ''
  let decimals: number | undefined
  let totalSupply: number | undefined
  let usedSuffix = ''
  let sectionTitle: string
  let desc: string | undefined
  let cutDesc: string | undefined

  if (assetType === 'fungible') {
    name = assetMetadata.name
    decimals = assetMetadata.decimals
    usedSuffix = assetMetadata.symbol
    totalSupply = assetMetadata.totalSupply
    sectionTitle = 'Token'
  } else if (assetType === 'non-fungible') {
    name = assetMetadata.file?.name
    desc = assetMetadata.file?.description
    cutDesc = desc && desc?.length > 200 ? assetMetadata.file?.description?.substring(0, 200) + '...' : desc
    sectionTitle = 'NFT'
  } else if (assetType === undefined) {
    sectionTitle = 'Unknown'
  } else {
    sectionTitle = 'Unknown'
  }

  let addressGroup

  try {
    addressGroup = groupOfAddress(tokenAddress)
  } catch (e) {
    console.log(e)

    displaySnackbar({
      text: getHumanReadableError(e, 'Impossible to get the group of this token'),
      type: 'alert'
    })
  }

  const { data: tokenBalance } = useQuery({
    ...queries.tokens.balance.details(tokenHash),
    enabled: !!tokenHash
  })

  const { data: txList, isLoading: txListLoading } = useQuery({
    ...queries.tokens.transactions.confirmed(tokenHash, pageNumber, numberOfTxsPerPage),
    enabled: !!tokenHash,
    keepPreviousData: true
  })

  const { data: txNumber, isLoading: txNumberLoading } = useQuery({
    ...queries.tokens.transactions.total(tokenHash),
    enabled: !!tokenHash
  })

  const { data: latestTransaction } = useQuery({
    ...queries.tokens.transactions.confirmed(tokenHash, 1, 1),
    enabled: !!tokenHash
  })

  const tokenLatestActivity =
    latestTransaction && latestTransaction.length > 0 ? latestTransaction[0].timestamp : undefined

  const totalBalance = tokenBalance?.balance
  const lockedBalance = tokenBalance?.lockedBalance

  let image
  if (assetType === 'non-fungible') {
    image = <Image style={{ backgroundImage: `url(${assetMetadata.file?.image})` }} />
  } else if (assetType === 'non-fungible') {
    image = <Image style={{ backgroundImage: `url(${assetMetadata.logo})` }} />
  }

  return (
    <Section>
      <SectionTitle title={t(sectionTitle)} subtitle={<HighlightedHash text={tokenHash} textToCopy={tokenHash} />} />

      {image}

      <InfoGrid>
        <InfoGrid.Cell label={t('Name')} value={name} />

        {assetType === 'fungible' ? (
          <>
            <InfoGrid.Cell label={t('Symbol')} value={assetMetadata.symbol} />
          <InfoGrid.Cell
            label={t('Balance')}
            value={totalSupply && <Amount assetId={tokenHash} value={BigInt(totalSupply)} />}
            sublabel={
              lockedBalance &&
              lockedBalance !== '0' && (
                <Badge
                  content={
                    <span>
                      {t('Locked')}: <Amount assetId={tokenHash} value={BigInt(lockedBalance)} />
                    </span>
                  }
                  type="neutral"
                />
              )
            }
          />
            <InfoGrid.Cell label={t('Decimals')} value={assetMetadata.decimals} />
          </>
        ) : assetType === 'non-fungible' ? (
          <InfoGrid.Cell
            label="Description"
            value={assetMetadata.file?.description ? assetMetadata.file?.description : '-'}
          />
        ) : (
          <></>
        )}
        <InfoGrid.Cell label={t('Address')} value={<AddressLink address={tokenAddress} flex={true} />} />
        <InfoGrid.Cell
          label={t('Nb. of transactions')}
          value={txNumber ? addApostrophes(txNumber.toFixed(0)) : !txNumberLoading ? 0 : undefined}
        />
        <InfoGrid.Cell label={t('Address group')} value={addressGroup?.toString()} />
        <InfoGrid.Cell
          label={t('Latest activity')}
          value={
            tokenLatestActivity ? (
              <Timestamp timeInMs={tokenLatestActivity} forceFormat="low" />
            ) : !txListLoading ? (
              t('No activity yet')
            ) : undefined
          }
        />
      </InfoGrid>
      <SectionHeader>
        <h2>{t('Transactions')}</h2>
      </SectionHeader>

      <Table hasDetails main scrollable isLoading={txListLoading}>
        {!txListLoading && txList?.length ? (
          <>
            <TableHeader
              headerTitles={[
                <span key="hash-time">
                  {t('Hash & Time')}
                  <TimestampExpandButton />
                </span>,
                'Assets',
                'Inputs',
                'Outputs',
                'Total Amounts',
                ''
              ]}
              columnWidths={['20%', '25%', '20%', '80px', '25%', '150px', '30px']}
              textAlign={['left', 'left', 'left', 'left', 'left', 'right', 'left']}
            />
            <TableBody tdStyles={TXTableBodyCustomStyles}>
              {txList &&
                txList
                  .sort((t1, t2) => (t2.timestamp && t1.timestamp ? t2.timestamp - t1.timestamp : 1))
                  .map((t, i) => <TokenTransactionRow transaction={t} tokenHash={tokenHash} key={i} />)}
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
    </Section>
  )
}

export default TokenInfoPage

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 35px;
  margin-bottom: 10px;
`

const InfoGrid = styled(AddressInfoGrid)`
  flex: 1;
`

const NoTxsMessage = styled.tr`
  color: ${({ theme }) => theme.font.secondary};
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 15px 20px;
`

const TXTableBodyCustomStyles: TDStyle[] = [
  {
    tdPos: 1,
    style: css`
      text-align: center;
      text-align: -webkit-center;
    `
  },
  {
    tdPos: 3,
    style: css`
      color: ${({ theme }) => theme.global.highlight};
    `
  },
  {
    tdPos: 4,
    style: css`
      text-align: center;
      color: ${({ theme }) => theme.font.secondary};
    `
  },
  {
    tdPos: 5,
    style: css`
      color: ${({ theme }) => theme.global.highlight};
    `
  }
]

const Image = styled.div`
  background-size: cover;
  background-position: center;
  height: 50%;
  width: 50%;
`
