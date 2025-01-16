import { LucideIcon } from 'lucide-react-native'
import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'

interface InfoBoxProps {
  title: string
  Icon: LucideIcon
  children: ReactNode
  iconColor?: string
  bgColor?: string
  style?: StyleProp<ViewStyle>
}

const InfoBox = ({ title, Icon, iconColor, children, style }: InfoBoxProps) => {
  const theme = useTheme()

  return (
    <View style={style}>
      <IconColumn>
        <Icon size={64} color={iconColor ?? theme.font.primary} />
      </IconColumn>
      <ContentColumn>
        <Title>{title}</Title>
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
  padding: 38px 33px;
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
  margin-bottom: 12px;
`

const Content = styled.View`
  font-weight: 600;
  font-size: 16px;
`
