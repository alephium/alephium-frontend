import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import AddToFavoritesButton from '~/features/ecosystem/AddToFavoritesButton'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BrowserHeaderProps {
  dAppName: string
  currentUrl: string
}

const DappBrowserHeader = ({ dAppName, currentUrl }: BrowserHeaderProps) => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  return (
    <BrowserHeaderStyled style={{ paddingTop: insets.top }}>
      <Button onPress={navigation.goBack} iconProps={{ name: 'arrow-left' }} squared compact />
      <Url truncate color="secondary">
        {currentUrl}
      </Url>
      <AddToFavoritesButton dAppName={dAppName} />
    </BrowserHeaderStyled>
  )
}

export default DappBrowserHeader

const BrowserHeaderStyled = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: ${DEFAULT_MARGIN}px;
  padding-right: ${DEFAULT_MARGIN}px;
  padding-bottom: 5px;
  gap: ${DEFAULT_MARGIN}px;
`

const Url = styled(AppText)`
  flex-shrink: 1;
`
