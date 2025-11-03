import { useNavigation } from '@react-navigation/native'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import AddToFavoritesButton from '~/features/ecosystem/AddToFavoritesButton'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BrowserHeaderProps {
  currentUrl: string
  onUrlChange: (url: string) => void
  dAppName?: string
}

const DappBrowserHeader = ({ dAppName, currentUrl, onUrlChange }: BrowserHeaderProps) => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()

  const openEditUrlModal = () =>
    dispatch(openModal({ name: 'EditDappUrlModal', props: { url: currentUrl, onUrlChange } }))

  return (
    <BrowserHeaderStyled style={{ paddingTop: insets.top }}>
      <Button onPress={navigation.goBack} iconProps={{ name: 'arrow-back' }} squared compact />
      <PressableUrl onPress={openEditUrlModal}>
        <Url truncate color="secondary">
          {currentUrl}
        </Url>
      </PressableUrl>
      {dAppName && <AddToFavoritesButtonStyled dAppName={dAppName} />}
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

const PressableUrl = styled(Pressable)`
  flex-shrink: 1;
  background-color: ${({ theme }) => theme.bg.highlight};
  border-radius: 100px;
  padding: 0 14px 0 18px;
  width: 100%;
`

const Url = styled(AppText)`
  flex-shrink: 1;
  padding: 10px 0;
  color: ${({ theme }) => theme.font.secondary};
`

const AddToFavoritesButtonStyled = styled(AddToFavoritesButton)`
  margin-left: auto;
`
