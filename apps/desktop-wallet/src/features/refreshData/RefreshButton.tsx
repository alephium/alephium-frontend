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
