import { ReactNode, useState } from 'react'

import TableTabBar from '@/components/TableTabBar'
import { TabItem } from '@/components/tabs/TabBar'

interface TabsProps<T extends string> {
  tabs: TabItem<T>[]
  renderTab: (tab: TabItem<T>['value']) => ReactNode
  className?: string
}

const Tabs = <T extends string>({ tabs, className, renderTab }: TabsProps<T>) => {
  const [currentTab, setCurrentTab] = useState(tabs[0])

  return (
    <div className={className}>
      <TableTabBar items={tabs} onTabChange={setCurrentTab} activeTab={currentTab} />
      {renderTab(currentTab.value)}
    </div>
  )
}

export default Tabs
