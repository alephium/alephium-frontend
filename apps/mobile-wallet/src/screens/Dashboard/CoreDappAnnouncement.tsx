import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { View } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import RootStackParamList from '~/navigation/rootStackRoutes'

const CoreDappAnnouncement = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const handleClick = () => {
    navigation.navigate('DAppWebViewScreen', {
      dAppUrl: '', // TODO: add the actual URL. Should match Alphland.
      dAppName: 'Alephium Core' // TODO: add the actual name. Should match Alphland.
    })
  }

  return (
    <CoreDappAnnouncementStyled>
      <AppText>
        <AppText bold>Alephium Core</AppText> is on Testnet!
      </AppText>
      <Button title="Open" onPress={handleClick} iconProps={{ name: 'open-outline' }} variant="accent" short />
    </CoreDappAnnouncementStyled>
  )
}

export default CoreDappAnnouncement

const CoreDappAnnouncementStyled = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.bg.accent};
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 16px;
`
