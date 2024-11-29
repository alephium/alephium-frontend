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

import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import { appHeaderHeightPx } from '@/style/globalStyles'

interface UnlockedWalletPageProps extends MotionProps {
  title?: string
  subtitle?: string
  BottomComponent?: ReactNode
  className?: string
}

const UnlockedWalletPage: FC<UnlockedWalletPageProps> = ({ title, subtitle, BottomComponent, children, ...props }) => (
  <motion.div {...fadeIn} {...props}>
    {(title || subtitle) && (
      <PageHeader>
        <TitleContainer style={{ marginBottom: BottomComponent ? 0 : 50 }}>
          {title && <PageTitle>{title}</PageTitle>}
          {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
        </TitleContainer>
        {BottomComponent}
      </PageHeader>
    )}
    {children}
  </motion.div>
)

export default styled(UnlockedWalletPage)`
  background-color: ${({ theme }) => theme.bg.background2};
  padding-top: ${appHeaderHeightPx}px;
`

const PageHeader = styled(UnlockedWalletPanel)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
  margin-top: 35px;
  margin-left: var(--spacing-4);
`

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const PageTitle = styled.h1`
  font-size: 34px;
  font-weight: var(--fontWeight-semiBold);
  margin-top: 0;
  margin-bottom: 20px;
`

const PageSubtitle = styled.div`
  max-width: 400px;
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
`
