import { Image } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { ScreenSection } from '~/components/layout/Screen'

interface ConnectDappModalHeaderProps {
  dAppUrl?: string
  dAppName?: string
  dAppIcon?: string
}

const ConnectDappModalHeader = ({ dAppName, dAppIcon, dAppUrl }: ConnectDappModalHeaderProps) => (
  <ScreenSection>
    <DAppInfo>
      {dAppIcon && <DAppIcon source={{ uri: dAppIcon }} />}

      <DAppName>
        {dAppName && (
          <AppText color="secondary" size={16}>
            {dAppName}
          </AppText>
        )}
        {dAppUrl && (
          <AppText color="tertiary" size={13}>
            {dAppUrl}
          </AppText>
        )}
      </DAppName>
    </DAppInfo>
  </ScreenSection>
)

export default ConnectDappModalHeader

const DAppInfo = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`

const DAppIcon = styled(Image)`
  width: 50px;
  height: 50px;
`

const DAppName = styled.View``
