import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Row, { RowProps } from '~/components/Row'

interface RadioButtonRowProps extends Omit<RowProps, 'children'> {
  title: string
  isActive: boolean
}

const RadioButtonRow = ({ title, isActive, ...props }: RadioButtonRowProps) => {
  const theme = useTheme()

  return (
    <Row key={title} {...props}>
      <RowContents>
        <RadioButton style={{ backgroundColor: isActive ? theme.global.accent : theme.bg.primary }}>
          {isActive && <RadioButtonChecked />}
        </RadioButton>
        <Title>{title}</Title>
      </RowContents>
    </Row>
  )
}

export default RadioButtonRow

const RadioButton = styled.View`
  width: 19px;
  height: 19px;
  border-radius: 19px;
  margin-right: 21px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

export const RadioButtonChecked = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 10px;
  background-color: white;
`

const RowContents = styled.View`
  flex-direction: row;
`

const Title = styled(AppText)`
  font-weight: 500;
  font-size: 14px;
`
