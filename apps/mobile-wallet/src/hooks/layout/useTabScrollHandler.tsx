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
