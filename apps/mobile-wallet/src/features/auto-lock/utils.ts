import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const autoLockSeconds = [5, 15, 30, 60]

export const useAutoLockSecondsOptions = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        label: t('Fast'),
        value: 0
      },
      ...autoLockSeconds.map((sec) => ({
        label: t('{{ seconds }} seconds', { seconds: sec }),
        value: sec
      })),
      {
        label: t('Never'),
        value: -1
      }
    ],
    [t]
  )
}

export const useAutoLockLabel = (seconds: number) => {
  const options = useAutoLockSecondsOptions()

  return options.find((option) => option.value === seconds)?.label
}
