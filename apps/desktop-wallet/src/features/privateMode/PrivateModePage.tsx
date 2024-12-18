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

import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Button from '@/components/Button'
import { FloatingPanel } from '@/components/PageComponents/PageContainers'
import { ReactComponent as LedgerLogo } from '@/images/ledger.svg'
import LockedWalletLayout from '@/pages/LockedWalletLayout'

const PrivateModePage = () => {
  const navigate = useNavigate()

  return (
    <LockedWalletLayout>
      <FloatingPanel>
        <Boxes>
          <Box>
            <IconContainer>
              <Icon>
                <LedgerLogoStyled />
              </Icon>
            </IconContainer>
            <BoxText>Connect with your Ledger wallet without leaving traces.</BoxText>
            <Button onClick={() => navigate('/ledger')}>Connect your Ledger</Button>
          </Box>
          <Box>
            <Icon></Icon>
            <BoxText>Unlock a wallet with a passphrase (25th word). Passphrase wallets leave less traces.</BoxText>
            <Button>Use passphrase</Button>
          </Box>
        </Boxes>
        <BottomButtonContainer>
          <Button role="secondary" onClick={() => navigate('/')}>
            Back
          </Button>
        </BottomButtonContainer>
      </FloatingPanel>
    </LockedWalletLayout>
  )
}

export default PrivateModePage

const Boxes = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-4);
`

const Box = styled.div`
  flex: 1;
  flex-direction: column;
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-huge);
  background-color: ${({ theme }) => theme.bg.background1};
  padding: var(--spacing-4);
  gap: var(--spacing-4);
`

const BoxText = styled.div`
  flex: 1;
  text-align: center;
`

const IconContainer = styled.div`
  flex: 1;
  display: flex;
`

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  height: 100px;
  width: 100px;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.bg.contrast};
`

const LedgerLogoStyled = styled(LedgerLogo)`
  path {
    fill: ${({ theme }) => theme.font.contrastPrimary};
  }
`

const BottomButtonContainer = styled.div`
  margin: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
`
