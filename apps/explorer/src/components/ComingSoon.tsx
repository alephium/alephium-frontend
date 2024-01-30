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

import logo from '@/images/alephium-logo-gradient-stroke.svg'

const ComingSoon = ({ text }: { text: string }) => (
  <ComingSoonWrapper>
    <ComingSoonLogo />
    <ComingSoonText>{text}</ComingSoonText>
  </ComingSoonWrapper>
)

const ComingSoonWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 100px;
`

const ComingSoonLogo = styled.div`
  background-image: url(${logo});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  min-height: 150px;
  max-height: 300px;
  height: 25%;
  width: 100%;
  margin-bottom: 25px;
`

const ComingSoonText = styled.p`
  text-align: center;
`

export default ComingSoon
