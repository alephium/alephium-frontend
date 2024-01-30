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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { PagerViewOnPageScrollEventData } from 'react-native-pager-view'
import { useEvent, useHandler } from 'react-native-reanimated'

const useTabScrollHandler = (handler: (e: PagerViewOnPageScrollEventData) => void, dependencies?: any) => {
  const { doDependenciesDiffer } = useHandler({ onPageScroll: handler }, dependencies)
  const subscribeForEvents = ['onPageScroll']

  return useEvent<any>(
    (event) => {
      'worklet'
      if (event.eventName.endsWith('onPageScroll')) {
        handler(event)
      }
    },
    subscribeForEvents,
    doDependenciesDiffer
  )
}

export default useTabScrollHandler
