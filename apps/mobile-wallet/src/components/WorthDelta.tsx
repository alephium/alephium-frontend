import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'

interface WorthDeltaProps {
  delta: number
  style?: StyleProp<ViewStyle>
}

const WorthDelta = ({ delta, style }: WorthDeltaProps) => {
  const isInvalidNumber = isNaN(delta)

  const isUp = delta >= 0
  const textColor = isInvalidNumber ? 'tertiary' : isUp ? 'valid' : 'alert'

  return (
    <WorthDeltaStyled style={style}>
      <Amount color={textColor} semiBold size={18} value={delta} isFiat showPlusMinus />
    </WorthDeltaStyled>
  )
}

export default WorthDelta

const WorthDeltaStyled = styled.View`
  align-items: center;
  flex-direction: row;
  gap: 12px;
  min-width: 10px;
`
