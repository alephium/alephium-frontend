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

const eventThrottleStatus: Record<string, boolean> = {}

const ANALYTICS_THROTTLING_TIMEOUT = 5000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnalyticsProps = { [key: string]: any }

export const throttleEvent = (callback: () => void, event: string, props?: AnalyticsProps) => {
  const eventKey = `${event}:${props ? Object.keys(props).map((key) => `${key}:${props[key]}`) : ''}`

  if (!eventThrottleStatus[eventKey]) {
    callback()
    eventThrottleStatus[eventKey] = true

    setTimeout(() => {
      eventThrottleStatus[eventKey] = false
    }, ANALYTICS_THROTTLING_TIMEOUT)
  }
}
