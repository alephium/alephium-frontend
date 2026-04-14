// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.self = global as any // workaround for web3 import causing error while running tests

// @ts-expect-error React Native global
globalThis.__DEV__ = true

vi.mock('react-native', () => ({
  Alert: { alert: vi.fn() },
  Appearance: { getColorScheme: vi.fn(() => 'light'), addChangeListener: vi.fn() },
  AppState: { currentState: 'active', addEventListener: vi.fn() },
  Dimensions: { get: vi.fn(() => ({ width: 375, height: 812 })), addEventListener: vi.fn() },
  Linking: { openURL: vi.fn(), addEventListener: vi.fn(), getInitialURL: vi.fn() },
  Platform: { OS: 'ios', select: vi.fn((obj: Record<string, unknown>) => obj.ios) },
  NativeModules: {},
  StyleSheet: { create: (styles: Record<string, unknown>) => styles },
  View: vi.fn(),
  Text: vi.fn(),
  Image: vi.fn(),
  InteractionManager: { runAfterInteractions: vi.fn((cb: () => void) => cb()) }
}))

vi.mock('react-native-mmkv', () => {
  const createMmkvMock = () => {
    const data = new Map()
    return {
      set: (key: string, value: unknown) => data.set(key, value),
      getString: (key: string) => data.get(key) as string | undefined,
      getBoolean: (key: string) => data.get(key) as boolean | undefined,
      getNumber: (key: string) => data.get(key) as number | undefined,
      contains: (key: string) => data.has(key),
      delete: (key: string) => data.delete(key),
      clearAll: () => data.clear(),
      getAllKeys: () => [...data.keys()]
    }
  }

  return { MMKV: vi.fn(createMmkvMock) }
})

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    multiGet: vi.fn(),
    multiSet: vi.fn(),
    multiRemove: vi.fn(),
    clear: vi.fn(),
    getAllKeys: vi.fn(() => Promise.resolve([]))
  }
}))

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY'
}))

vi.mock('expo-local-authentication', () => ({
  hasHardwareAsync: vi.fn(),
  isEnrolledAsync: vi.fn(),
  authenticateAsync: vi.fn()
}))

vi.mock('expo-clipboard', () => ({
  setStringAsync: vi.fn()
}))

vi.mock('posthog-react-native', () => {
  const PostHog = vi.fn(() => ({
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    flush: vi.fn(),
    screen: vi.fn(),
    isFeatureEnabled: vi.fn()
  }))

  return {
    default: PostHog,
    PostHog,
    usePostHog: vi.fn(() => ({ capture: vi.fn() })),
    PostHogProvider: vi.fn()
  }
})

vi.mock('react-native-toast-message', () => ({
  default: { show: vi.fn(), hide: vi.fn() }
}))

vi.mock('@sentry/react-native', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  withScope: vi.fn(),
  Severity: {},
  wrap: vi.fn((component: unknown) => component)
}))

vi.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1'
}))

vi.mock('expo-localization', () => ({
  getLocales: vi.fn(() => [{ languageCode: 'en', countryCode: 'US' }])
}))

vi.mock('react-native-localize', () => ({
  getLocales: vi.fn(() => [{ languageCode: 'en', countryCode: 'US' }]),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}))
