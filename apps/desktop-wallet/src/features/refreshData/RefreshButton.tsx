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

import { RefreshCw } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import useRefreshBalances from '@/features/refreshData/useRefreshBalances'

const RefreshButton = memo(() => {
  const { refreshBalances, isFetchingBalances } = useRefreshBalances()

  return <RefreshBtn onClick={refreshBalances} isLoading={isFetchingBalances} />
})

export default RefreshButton

interface RefreshBtnProps {
  onClick: () => void
  isLoading: boolean
}

const RefreshBtn = memo(({ onClick, isLoading }: RefreshBtnProps) => {
  const { t } = useTranslation()

  return (
    <RefreshBtnStyled
      Icon={RefreshCw}
      transparent
      squared
      short
      role="secondary"
      onClick={onClick}
      aria-label={t('Refresh')}
      data-tooltip-id="default"
      data-tooltip-content={t('Refresh data')}
      isLoading={isLoading}
    />
  )
})

const RefreshBtnStyled = styled(Button)<Pick<RefreshBtnProps, 'isLoading'>>`
  position: relative;

  svg {
    animation: ${({ isLoading }) => (isLoading ? 'spin 2s linear infinite' : 'none')};
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`
