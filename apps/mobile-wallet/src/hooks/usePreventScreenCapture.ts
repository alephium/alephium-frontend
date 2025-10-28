import { useEffect } from 'react'
import { CaptureProtection } from 'react-native-capture-protection'

// TODO: Replace react-native-capture-protection with expo-screen-capture after
// upgrading to Expo 54 and see if the following 2 issues reemerge:
// - #1549
// - #1548
// If they don't, delete this hook and use expo-screen-capture instead.

const usePreventScreenCapture = () => {
  useEffect(() => {
    CaptureProtection.prevent()

    return () => {
      CaptureProtection.allow()
    }
  }, [])
}

export default usePreventScreenCapture
