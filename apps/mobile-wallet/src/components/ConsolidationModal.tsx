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

import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import { ModalContent, ModalContentProps } from '~/features/modals/ModalContent'

interface ConsolidationModalProps extends ModalContentProps {
  onConsolidate: () => void
  fees: bigint
}

const ConsolidationModal = ({ onConsolidate, fees, ...props }: ConsolidationModalProps) => {
  const { t } = useTranslation()

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection>
        <ModalScreenTitle>{t('Consolidation required')}</ModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
        <View>
          <AppText>
            {t(
              'It appears that the address you use to send funds from has too many UTXOs! Would you like to consolidate them? This will cost as small fee.'
            )}
          </AppText>
          <Fee>
            <AppText>{t('Fee')}:</AppText>
            <Amount value={fees} fullPrecision fadeDecimals bold />
          </Fee>
        </View>
      </ScreenSection>
      <ScreenSection centered>
        <ButtonsRow>
          <Button title={t('Cancel')} onPress={props.onClose} flex variant="accent" short />
          <Button title={t('Consolidate')} onPress={onConsolidate} variant="highlight" flex short />
        </ButtonsRow>
      </ScreenSection>
    </ModalContent>
  )
}

export default ConsolidationModal

const Fee = styled.View`
  flex-direction: row;
  gap: 5px;
  margin-top: 20px;
`
