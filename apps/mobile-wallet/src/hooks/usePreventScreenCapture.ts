import { useEffect } from 'react'
import { CaptureProtection } from 'react-native-capture-protection'

// TODO: Replace react-native-capture-protection with expo-screen-capture after
// upgrading to Expo 54 and see if the following 2 issues reemerge:
// - #1549
// - #1548
// If they don't, delete this hook and use expo-screen-capture instead.

// A transition between two secret-showing screens mounts the arriving consumer before unmounting
// the leaving one, so an unconditional allow() on unmount would drop protection while secrets are
// still on screen.
let consumers = 0

const usePreventScreenCapture = () => {
  useEffect(() => {
    consumers += 1

    if (consumers === 1) CaptureProtection.prevent()

    return () => {
      consumers -= 1

      if (consumers === 0) CaptureProtection.allow()
    }
  }, [])
}

export default usePreventScreenCapture
