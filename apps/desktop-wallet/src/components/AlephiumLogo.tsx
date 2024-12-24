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

import { ReactComponent as AlephiumLogoSVG } from '@/images/alephium_logo_monochrome.svg'

export default styled(AlephiumLogoSVG)<{ contrasted?: boolean }>`
  width: 38px;
  height: auto;

  path {
    fill: ${({ theme, contrasted }) => (contrasted ? theme.font.contrastPrimary : theme.font.primary)} !important;
  }
`
