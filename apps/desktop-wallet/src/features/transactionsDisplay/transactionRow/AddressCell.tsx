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

import styled, { css } from 'styled-components'

const AddressCell = styled.div<{ alignRight?: boolean; hasMargins?: boolean }>`
  flex: 1;
  min-width: 0;
  align-items: baseline;
  display: flex;

  ${({ hasMargins }) =>
    hasMargins &&
    css`
      margin: 0 var(--spacing-4);
    `}

  ${({ alignRight }) =>
    alignRight &&
    css`
      justify-content: flex-end;
    `}
`

export default AddressCell
