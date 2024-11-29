/*
Copyright 2018 - 2024 The Alephium Authors
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

import styled from 'styled-components'

import Amount, { AmountLoaderProps } from '@/components/Amount'

interface WorthOverviewProps extends AmountLoaderProps {
  worth: number
  overrideWorth?: number
  className?: string
}

const WorthOverview = ({ overrideWorth, worth, ...props }: WorthOverviewProps) => (
  <WorthOverviewStyled value={overrideWorth ?? worth} isFiat loaderHeight={32} tabIndex={0} {...props} />
)

export default WorthOverview

const WorthOverviewStyled = styled(Amount)`
  font-size: 32px;
  font-weight: var(--fontWeight-bold);
`
