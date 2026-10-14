import { AppState, AppStateStatus } from 'react-native'

// Minimal single-component hook runner: enough of React's useState/useRef/useEffect semantics to drive useAutoLock
// without a renderer (none is installed in the mobile wallet test setup).
const runner = vi.hoisted(() => {
  type Effect = { deps?: unknown[]; cleanup?: () => void; pending?: () => void | (() => void) }

  const state = {
    slots: [] as unknown[],
    effects: [] as Effect[],
    index: 0,
    effectIndex: 0,
    rendering: false,
    dirty: false,
    component: undefined as (() => void) | undefined
  }

  const depsChanged = (prev?: unknown[], next?: unknown[]) =>
    !prev || !next || prev.length !== next.length || prev.some((dep, i) => !Object.is(dep, next[i]))

  const render = () => {
    if (!state.component) return
    if (state.rendering) {
      state.dirty = true
      return
    }

    do {
      state.dirty = false
      state.rendering = true
      state.index = 0
      state.effectIndex = 0
      state.component()
      state.rendering = false

      for (const effect of state.effects) {
        if (!effect.pending) continue
        const run = effect.pending
        effect.pending = undefined
        effect.cleanup?.()
        const cleanup = run()
        effect.cleanup = typeof cleanup === 'function' ? cleanup : undefined
      }
    } while (state.dirty)
  }

  const react = {
    useState: <T>(initial: T) => {
      const i = state.index++
      if (!(i in state.slots)) state.slots[i] = initial
      const setState = (value: T) => {
        if (Object.is(state.slots[i], value)) return
        state.slots[i] = value
        render()
      }
      return [state.slots[i] as T, setState] as const
    },
    useRef: <T>(initial: T) => {
      const i = state.index++
      if (!(i in state.slots)) state.slots[i] = { current: initial }
      return state.slots[i] as { current: T }
    },
    useEffect: (fn: () => void | (() => void), deps?: unknown[]) => {
      const i = state.effectIndex++
      const effect = (state.effects[i] ??= {})
      if (depsChanged(effect.deps, deps)) {
        effect.deps = deps
        effect.pending = fn
      }
    }
  }

  const mount = (component: () => void) => {
    state.slots = []
    state.effects = []
    state.component = component
    render()
  }

  return { react, render, mount }
})

vi.mock('react', () => runner.react)

const store = vi.hoisted(() => ({
  state: {
    settings: { loadedFromStorage: true, usesBiometrics: true, autoLockSeconds: 0 },
    app: { isCameraOpen: false },
    wallet: { isUnlocked: false }
  }
}))

vi.mock('~/hooks/redux', () => ({
  useAppSelector: (selector: (s: typeof store.state) => unknown) => selector(store.state),
  useAppDispatch: () => (action: { type: string }) => {
    if (action.type === 'app/appBecameInactive') store.state.wallet.isUnlocked = false
  }
}))

vi.mock('@alephium/shared/store', () => ({ appBecameInactive: () => ({ type: 'app/appBecameInactive' }) }))

import useAutoLock from '~/features/auto-lock/useAutoLock'

let appStateListeners: ((state: AppStateStatus) => void)[] = []

const setAppState = (next: AppStateStatus) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(AppState as any).currentState = next
  appStateListeners.forEach((listener) => listener(next))
}

// Mirrors what iOS does when the Face ID sheet is shown: the app goes `inactive` while the system sheet is up (it never
// goes to `background`) and back to `active` once the sheet is dismissed, whatever the outcome.
let openPrompts: (() => void)[] = []

const unlockApp = vi.fn(async () => {
  setAppState('inactive')
  await new Promise<void>((resolve) => openPrompts.push(resolve))
})

const dismissFaceIdPrompt = (outcome: 'success' | 'cancel') => {
  const resolve = openPrompts.shift()
  if (!resolve) return false

  setAppState('active')

  if (outcome === 'success') {
    store.state.wallet.isUnlocked = true
    runner.render()
  }

  resolve()
  return true
}

describe('useAutoLock on iOS with Face ID', () => {
  beforeEach(() => {
    appStateListeners = []
    openPrompts = []
    unlockApp.mockClear()
    store.state.wallet.isUnlocked = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(AppState as any).currentState = 'active'
    vi.mocked(AppState.addEventListener).mockImplementation((_, listener) => {
      appStateListeners.push(listener as (state: AppStateStatus) => void)
      return {
        remove: () => {
          appStateListeners = appStateListeners.filter((l) => l !== listener)
        }
      } as ReturnType<typeof AppState.addEventListener>
    })
  })

  it('prompts once on launch', () => {
    runner.mount(() => useAutoLock(unlockApp))

    expect(unlockApp).toHaveBeenCalledTimes(1)
  })

  it('does not re-prompt when the user cancels the Face ID sheet', () => {
    runner.mount(() => useAutoLock(unlockApp))

    for (let i = 0; i < 10; i++) {
      if (!dismissFaceIdPrompt('cancel')) break
    }

    expect(unlockApp).toHaveBeenCalledTimes(1)
  })

  it('does not prompt a second time when Face ID succeeds', () => {
    runner.mount(() => useAutoLock(unlockApp))

    dismissFaceIdPrompt('success')

    expect(unlockApp).toHaveBeenCalledTimes(1)
    expect(openPrompts).toHaveLength(0)
  })

  it('prompts again when the app comes back from the background after being locked', () => {
    store.state.wallet.isUnlocked = true
    runner.mount(() => useAutoLock(unlockApp))
    expect(unlockApp).not.toHaveBeenCalled()

    setAppState('inactive')
    setAppState('background')
    runner.render()
    expect(store.state.wallet.isUnlocked).toBe(false)

    setAppState('active')

    expect(unlockApp).toHaveBeenCalledTimes(1)
  })
})
