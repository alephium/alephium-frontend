import { useFetchAddressFtsSorted, useFetchAddressTokensByType } from '@alephium/shared-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiCopperDiamondLine, RiNftLine, RiQuestionLine } from 'react-icons/ri'
import styled, { useTheme } from 'styled-components'

import TableTabBar, { TabItem } from '@/components/Table/TableTabBar'
import NFTList from '@/pages/AddressInfoPage/NFTList'
import TokenList from '@/pages/AddressInfoPage/TokenList'

interface AssetListProps {
  addressStr: string
  className?: string
}

const AssetList = ({ addressStr, className }: AssetListProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const { data: sortedFts, isLoading: isLoadingFts } = useFetchAddressFtsSorted(addressStr)
  const {
    data: { nftIds, nstIds },
    isLoading: isLoadingTokensByType
  } = useFetchAddressTokensByType(addressStr)

  const tabs: TabItem[] = [
    {
      value: 'tokens',
      icon: <RiCopperDiamondLine />,
      label: t('Tokens'),
      length: sortedFts.length,
      loading: isLoadingFts,
      highlightColor: '#0cbaff'
    },
    {
      value: 'nfts',
      label: t('NFTs'),
      icon: <RiNftLine />,
      length: nftIds.length,
      loading: isLoadingTokensByType,
      highlightColor: '#ffae0c'
    }
  ]

  if (!isLoadingTokensByType && nstIds.length > 0)
    tabs.push({
      value: 'unknown',
      label: t('Unknown'),
      icon: <RiQuestionLine size={14} />,
      length: nstIds.length,
      loading: isLoadingTokensByType,
      highlightColor: theme.font.primary
    })

  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  const nsts = useMemo(() => nstIds.map((id) => ({ id })), [nstIds])

  return (
    <div className={className}>
      <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
      {sortedFts.length > 0 || nftIds.length > 0 ? (
        {
          tokens: <TokenList tokens={sortedFts} isLoading={isLoadingFts} addressStr={addressStr} />,
          nfts: <NFTList addressStr={addressStr} />,
          unknown: nstIds.length > 0 && (
            <TokenList tokens={nsts} isLoading={isLoadingTokensByType} addressStr={addressStr} />
          )
        }[currentTab.value]
      ) : (
        <EmptyListContainer>{t('No assets yet')}</EmptyListContainer>
      )}
    </div>
  )
}

export default styled(AssetList)`
  margin-bottom: 35px;
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 8px;
  overflow: hidden;
`

const EmptyListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: ${({ theme }) => theme.font.secondary};
  padding: 15px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
`
