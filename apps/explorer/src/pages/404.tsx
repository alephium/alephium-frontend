import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Waves from '@/components/Wave/Waves'

const PageNotFound = ({ className }: { className?: string }) => {
  const { t } = useTranslation()

  return (
    <div className={className}>
      <Title>404 - {t('Page not found')}</Title>
      <LetsGoBack>
        <Trans t={t} i18nKey="letsGoBack" components={{ 1: <Link to="/" /> }}>
          {"Let's go back to the <1>home page</1>."}
        </Trans>
      </LetsGoBack>
      <Waves />
    </div>
  )
}

export default styled(PageNotFound)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  align-items: center;
`

const Title = styled.h1`
  color: ${({ theme }) => theme.font.primary};
  font-weight: 600;
  font-size: 2rem;
`

const LetsGoBack = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 1.3rem;
`
