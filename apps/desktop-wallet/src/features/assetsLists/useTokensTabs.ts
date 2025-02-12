import { useTranslation } from 'react-i18next'

import { TabItem } from '@/components/tabs/TabBar'

const useTokensTabs = <T extends string>(type: 'address' | 'wallet'): Array<TabItem<T>> => {
  const { t } = useTranslation()

  const tabs = [
    { value: 'fts' as T, label: t(type === 'address' ? 'Address tokens' : 'Tokens') },
    { value: 'nfts' as T, label: t(type === 'address' ? 'Address NFTs' : 'NFTs') }
  ]

  if (type === 'address') {
    tabs.push({ value: 'activity' as T, label: t('Activity') })
  }

  return tabs
}

export default useTokensTabs
