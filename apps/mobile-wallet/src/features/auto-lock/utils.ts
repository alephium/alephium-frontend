import i18n from '~/features/localization/i18n'

const autoLockSeconds = [5, 15, 30, 60]

export const autoLockSecondsOptions = [
  {
    label: i18n.t('Fast'),
    value: 0
  },
  ...autoLockSeconds.map((sec) => ({
    label: i18n.t('{{ seconds }} seconds', { seconds: sec }),
    value: sec
  })),
  {
    label: i18n.t('Never'),
    value: -1
  }
]

export const getAutoLockLabel = (autoLockSeconds: number) =>
  autoLockSecondsOptions.find((option) => option.value === autoLockSeconds)?.label
