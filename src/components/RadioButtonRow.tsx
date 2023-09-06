/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Row, { RowProps } from '~/components/Row'

interface RadioButtonRowProps extends Omit<RowProps, 'children'> {
  title: string
  isActive: boolean
}

const RadioButtonRow = ({ title, isActive, ...props }: RadioButtonRowProps) => (
  <Row key={title} {...props}>
    <RowContents>
      <RadioButton>{isActive && <RadioButtonChecked />}</RadioButton>
      <Title>{title}</Title>
    </RowContents>
  </Row>
)

export default RadioButtonRow

const RadioButton = styled.View`
  width: 19px;
  height: 19px;
  border-radius: 19px;
  background-color: ${({ theme }) => theme.bg.secondary};
  margin-right: 21px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

export const RadioButtonChecked = styled.View`
  width: 13px;
  height: 13px;
  border-radius: 13px;
  background-color: ${({ theme }) => theme.font.primary};
`

const RowContents = styled.View`
  flex-direction: row;
`

const Title = styled(AppText)`
  font-weight: 500;
  font-size: 14px;
`
