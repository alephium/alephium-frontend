import { ScrollView, ScrollViewProps, View } from 'react-native'

export type ScrollSectionProps = ScrollViewProps

const ScrollSection = ({ children, style, ...props }: ScrollSectionProps) => (
  <ScrollView scrollEventThrottle={16} alwaysBounceVertical={false} {...props}>
    <View style={style}>{children}</View>
  </ScrollView>
)

export default ScrollSection
