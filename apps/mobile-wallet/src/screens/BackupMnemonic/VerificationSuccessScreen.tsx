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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback } from 'react'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { BackupMnemonicNavigationParamList } from '~/navigation/BackupMnemonicNavigation'
import { resetNavigation } from '~/utils/navigation'

interface VerificationSuccessScreenProps
  extends StackScreenProps<BackupMnemonicNavigationParamList, 'VerificationSuccessScreen'>,
    ScrollScreenProps {}

const VerificationSuccessScreen = ({ navigation, ...props }: VerificationSuccessScreenProps) => {
  const { setHeaderOptions } = useHeaderContext()

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => null
      })
    }, [setHeaderOptions])
  )

  return (
    <ScrollScreen fill {...props}>
      <ScreenSection centered verticallyCentered style={{ marginTop: 100 }}>
        <AppText size={100}>👍</AppText>
      </ScreenSection>
      <ScreenSection fill>
        <CenteredInstructions
          instructions={[
            { text: 'Well done!', type: 'primary' },
            { text: 'Enjoy your new (backed-up) wallet!', type: 'secondary' }
          ]}
          stretch
          fontSize={19}
        />
      </ScreenSection>
      <ScreenSection>
        <Button
          variant="highlight"
          title="Return to my wallet"
          onPress={() => resetNavigation(navigation.getParent())}
        />
      </ScreenSection>
    </ScrollScreen>
  )
}

export default VerificationSuccessScreen
