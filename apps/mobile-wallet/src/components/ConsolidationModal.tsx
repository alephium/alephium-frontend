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

import { Codesandbox } from 'lucide-react-native'
import { View } from 'react-native'
import styled from 'styled-components/native'

import Amount from '@/components/Amount'
import AppText from '@/components/AppText'
import Button from '@/components/buttons/Button'
import ButtonsRow from '@/components/buttons/ButtonsRow'
import InfoBox from '@/components/InfoBox'
import { ScreenSection } from '@/components/layout/Screen'
import ModalWithBackdrop from '@/components/ModalWithBackdrop'

interface ConsolidationModalProps {
  onConsolidate: () => void
  onCancel: () => void
  fees: bigint
}

const ConsolidationModal = ({ onConsolidate, onCancel, fees }: ConsolidationModalProps) => (
  <ModalWithBackdrop animationType="fade" visible>
    <ConsolidationModalContent>
      <ScreenSectionStyled fill>
        <InfoBox title="Action to take" Icon={Codesandbox} iconColor="#64f6c2">
          <View>
            <AppText>
              It appers that the address you use to send funds from has too many UTXOs! Would you like to consolidate
              them? This will cost as small fee.
            </AppText>
            <Fee>
              <AppText>Fee:</AppText>
              <Amount value={fees} fullPrecision fadeDecimals bold />
            </Fee>
          </View>
        </InfoBox>
      </ScreenSectionStyled>
      <ScreenSection centered>
        <ButtonsRow>
          <Button title="Cancel" onPress={onCancel} />
          <Button title="Consolidate" onPress={onConsolidate} />
        </ButtonsRow>
      </ScreenSection>
    </ConsolidationModalContent>
  </ModalWithBackdrop>
)

export default ConsolidationModal

const ConsolidationModalContent = styled.View`
  flex: 1;
  width: 100%;
  background-color: ${({ theme }) => theme.bg.primary};
`

const ScreenSectionStyled = styled(ScreenSection)`
  align-items: center;
  justify-content: center;
`

const Fee = styled(AppText)`
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin-top: 20px;
`
