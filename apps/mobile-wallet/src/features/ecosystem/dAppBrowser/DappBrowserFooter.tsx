import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import { useDappBrowserContext } from '~/features/ecosystem/dAppMessaging/DappBrowserContext'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface DappBrowserFooterProps {
  canGoBack: boolean
  canGoForward: boolean
}

const DappBrowserFooter = ({ canGoBack, canGoForward }: DappBrowserFooterProps) => {
  const webViewRef = useDappBrowserContext()

  const handleGoBack = () => webViewRef.current?.goBack()

  const handleGoForward = () => webViewRef.current?.goForward()

  const handleReload = () => webViewRef.current?.reload()

  return (
    <BrowserBottomStyled>
      <ButtonsList>
        <Button
          onPress={handleGoBack}
          iconProps={{ name: 'arrow-back' }}
          squared
          type="transparent"
          disabled={!canGoBack}
        />
        <Button
          onPress={handleGoForward}
          iconProps={{ name: 'arrow-forward' }}
          squared
          type="transparent"
          disabled={!canGoForward}
        />
      </ButtonsList>
      <Button onPress={handleReload} iconProps={{ name: 'refresh-outline' }} squared type="transparent" />
    </BrowserBottomStyled>
  )
}

export default DappBrowserFooter

const BrowserBottomStyled = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px ${DEFAULT_MARGIN}px;
  gap: ${DEFAULT_MARGIN}px;
`

const ButtonsList = styled.View`
  flex-direction: row;
  gap: 5px;
  align-items: center;
`
