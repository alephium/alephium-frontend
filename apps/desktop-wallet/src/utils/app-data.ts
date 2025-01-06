export const KEY_APPMETADATA = 'alephium/desktop-wallet/appmetadata'

export const currentVersion: string = import.meta.env.VITE_VERSION
export const isRcVersion: boolean = currentVersion.includes('-rc.')

export interface AppMetadataGitHub {
  lastTimeGitHubApiWasCalledForLatestVersion: Date
  lastTimeGitHubApiWasCalledForAnnouncenent: Date
}

export type AppMetaData = {
  lastAnnouncementHashChecked: string
} & AppMetadataGitHub

export const initialAppMetadataValues: AppMetaData = {
  lastTimeGitHubApiWasCalledForLatestVersion: new Date(0),
  lastTimeGitHubApiWasCalledForAnnouncenent: new Date(0),
  lastAnnouncementHashChecked: ''
}

type TypeConstructors = DateConstructor | undefined

const APPMETADATA_KEYS: Record<keyof AppMetaData, TypeConstructors> = {
  lastTimeGitHubApiWasCalledForLatestVersion: Date,
  lastTimeGitHubApiWasCalledForAnnouncenent: Date,
  lastAnnouncementHashChecked: undefined
}

export const appMetadataJsonParseReviver = (key: string, value: string): unknown => {
  const TypeConstructor = APPMETADATA_KEYS[key as keyof AppMetaData]

  return TypeConstructor ? new TypeConstructor(value) : value
}
