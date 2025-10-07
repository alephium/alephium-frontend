import { LucideIcon } from 'lucide-react-native'
import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface InfoBoxProps {
  title: string
  Icon: LucideIcon
  children: ReactNode
  iconColor?: string
  bgColor?: string
  style?: StyleProp<ViewStyle>
  narrow?: boolean
}

const InfoBox = ({ title, Icon, iconColor, children, style, narrow = false }: InfoBoxProps) => {
  const theme = useTheme()

  return (
    <View style={style}>
      {!narrow && (
        <IconColumn>
          <Icon size={64} color={iconColor ?? theme.font.primary} />
        </IconColumn>
      )}
      <ContentColumn>
        <TitleRow>
          {narrow ? (
            <>
              <Icon size={24} color={iconColor ?? theme.font.primary} />
              <Title>{title}</Title>
            </>
          ) : (
            <Title>{title}</Title>
          )}
        </TitleRow>
        <Content>{children}</Content>
      </ContentColumn>
    </View>
  )
}

export default styled(InfoBox)`
  flex-direction: row;
  align-items: center;
  background-color: ${({ bgColor, theme }) => bgColor ?? theme.bg.secondary};
  border-radius: 12px;
  padding: ${({ narrow }) => (narrow ? `${DEFAULT_MARGIN}px` : '38px 33px')};
`

const IconColumn = styled.View`
  align-items: center;
  margin-right: 20px;
  flex-shrink: 0;
  flex-grow: 1;
`

const ContentColumn = styled.View`
  flex-shrink: 1;
`

const Title = styled(AppText)`
  font-weight: 700;
  font-size: 18px;
`

const Content = styled.View`
  font-weight: 600;
  font-size: 16px;
`

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
`
