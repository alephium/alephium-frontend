import { SharedValue } from 'react-native-reanimated'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { ScreenSection, ScreenSectionProps } from '~/components/layout/Screen'
import ScreenTitle, { ScreenTitleProps } from '~/components/layout/ScreenTitle'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface ScreenIntroProps extends ScreenSectionProps {
  title?: string
  TitleSideComponent?: ScreenTitleProps['SideComponent']
  subtitle?: string
  scrollY?: SharedValue<number>
  paddingBottom?: boolean
  paddingTop?: boolean | number
}

const ScreenIntro = ({
  title,
  subtitle,
  scrollY,
  TitleSideComponent,
  paddingBottom,
  paddingTop,
  ...props
}: ScreenIntroProps) => (
  <ScreenSection {...props} style={[props.style, { paddingBottom: paddingBottom ? VERTICAL_GAP : 0 }]}>
    {title && (
      <ScreenTitle title={title} scrollY={scrollY} SideComponent={TitleSideComponent} paddingTop={paddingTop} />
    )}
    {subtitle && (
      <Subtitle size={16} medium color="secondary">
        {subtitle}
      </Subtitle>
    )}
  </ScreenSection>
)

export default ScreenIntro

const Subtitle = styled(AppText)`
  width: 90%;
`
