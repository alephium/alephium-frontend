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

import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Waves from '@/components/Wave/Waves'

const PageNotFound = ({ className }: { className?: string }) => (
  <div className={className}>
    <Title>404 - Page not found</Title>
    <LetsGoBack>
      Let&apos;s go back to the <Link to="/">home page.</Link>
    </LetsGoBack>
    <Waves />
  </div>
)

export default styled(PageNotFound)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  align-items: center;
`

const Title = styled.h1`
  color: ${({ theme }) => theme.font.primary};
  font-weight: 600;
  font-size: 2rem;
`

const LetsGoBack = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 1.3rem;
`
