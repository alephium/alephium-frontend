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

import React, { useState } from 'react'
import styled from 'styled-components'

import useInterval from '@/hooks/useInterval'

import LoadingSpinner from './LoadingSpinner'

interface RefreshTimerProps {
  lastRefreshTimestamp: number
  delay: number
  isLoading: boolean
}

const RefreshTimer: React.FC<RefreshTimerProps> = ({ lastRefreshTimestamp, delay, isLoading }) => {
  const [timeLeft, setTimeLeft] = useState(delay / 1000)

  const updateTimeLeft = () => setTimeLeft(Math.round((lastRefreshTimestamp + delay - Date.now()) / 1000))
  useInterval(updateTimeLeft, 1000)

  return isLoading || timeLeft <= 0 ? (
    <Timer>
      <LoadingSpinner size={14} />
      Loading...
    </Timer>
  ) : (
    <Timer>Refreshing in {timeLeft}s...</Timer>
  )
}

const Timer = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 0.9rem;
  display: flex;
  align-items: center;

  svg {
    margin-right: 5px;
  }
`
export default RefreshTimer
