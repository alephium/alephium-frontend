import { ChevronDown } from 'lucide-react-native'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleProp, View, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'

interface ExpandableRowProps {
  children: ReactNode
  title?: string
  titleComponent?: ReactNode
  style?: StyleProp<ViewStyle>
}

const ExpandableRow = ({ children, title, titleComponent, style }: ExpandableRowProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)

    Keyboard.dismiss()
  }

  const collapsableSectionStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isExpanded ? 1 : 0),
    height: withTiming(isExpanded ? 'auto' : 0)
  }))

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded ? '-180deg' : '-90deg') }]
  }))

  return (
    <View style={style}>
      <Header onPress={toggleExpanded}>
        {titleComponent ?? <Title>{title ?? t('Advanced options')}</Title>}
        <Animated.View style={chevronStyle}>
          <ChevronDownStyled size={20} color={theme.font.primary} />
        </Animated.View>
      </Header>
      <Animated.View style={collapsableSectionStyle}>{children}</Animated.View>
    </View>
  )
}

export default styled(ExpandableRow)`
  flex-direction: column;
  justify-content: center;
  padding-top: 0;
  padding-bottom: 0;
  padding: 0;
`

const Title = styled(AppText)`
  font-weight: bold;
  margin-right: 20px;
`

const ChevronDownStyled = styled(ChevronDown)`
  position: relative;
  top: 2px;
`

const Header = styled.TouchableOpacity`
  flex-direction: row;
  width: 100%;
  padding: 25px 0px;
  justify-content: space-between;
  border-radius: 16px;
`
