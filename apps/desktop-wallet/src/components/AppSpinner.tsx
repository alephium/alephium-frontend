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

import Spinner from '@/components/Spinner'
import { useAppSelector } from '@/hooks/redux'

interface AppSpinnerProps {
  className?: string
}

const AppSpinner = ({ className }: AppSpinnerProps) => {
  const loading = useAppSelector((s) => s.global.loading)

  if (!loading) return null

  return (
    <AppSpinnerStyled className={className}>
      <Spinner size="40px" />
    </AppSpinnerStyled>
  )
}

export default AppSpinner

const AppSpinnerStyled = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-black);
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(3px);
  z-index: 2;
`
