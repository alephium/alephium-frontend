declare module '*.png'
declare module '*.svg'
declare module '*.jpeg'
declare module '*.jpg'

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_STAKING_NETWORK_OVERRIDE?: string
  }
}
