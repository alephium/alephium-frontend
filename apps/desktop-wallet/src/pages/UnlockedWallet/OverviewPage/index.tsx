/*
Copyright 2018 - 2024 The Alephium Authors
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

import { useState } from 'react'
import styled from 'styled-components'

import { ShortcutButtonsGroupWallet } from '@/components/Buttons/ShortcutButtons'
import WorthOverviewPanel from '@/components/WorthOverviewPanel'
import { WalletTokensTabs } from '@/features/assetsLists/TokensTabs'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'

interface OverviewPageProps {
  className?: string
}

let wasChartAnimatedOnce = false

const OverviewPage = ({ className }: OverviewPageProps) => {
  const [chartVisible, setIsChartVisible] = useState(wasChartAnimatedOnce)

  const handleAnimationComplete = () => {
    setIsChartVisible(true)
    wasChartAnimatedOnce = true
  }

  return (
    <UnlockedWalletPage className={className} onAnimationComplete={() => handleAnimationComplete()}>
      <UnlockedWalletPanel bottom top>
        <WorthOverviewPanel chartVisible={chartVisible} chartInitiallyHidden={!chartVisible}>
          <Shortcuts>
            <ShortcutButtonsGroupWallet analyticsOrigin="overview_page" solidBackground />
          </Shortcuts>
        </WorthOverviewPanel>
      </UnlockedWalletPanel>
      <UnlockedWalletPanel bottom>
        <WalletTokensTabsStyled />
      </UnlockedWalletPanel>
    </UnlockedWalletPage>
  )
}

export default styled(OverviewPage)`
  background-color: ${({ theme }) => theme.bg.background1};
`

const WalletTokensTabsStyled = styled(WalletTokensTabs)`
  flex: 2;
`

const Shortcuts = styled.div`
  align-items: center;
  justify-content: center;
`
