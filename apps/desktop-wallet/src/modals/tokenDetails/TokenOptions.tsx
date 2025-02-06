import { MoreVertical } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import DropdownButton, { DropdownOption } from '@/components/DropdownButton'
import useAnalytics from '@/features/analytics/useAnalytics'
import { hideToken, unhideToken } from '@/features/hiddenTokens/hiddenTokensActions'
import { selectIsTokenHidden } from '@/features/hiddenTokens/hiddenTokensSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'

const TokenDropdownOptions = ({ tokenId }: TokenDetailsModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()
  const isTokenHidden = useAppSelector((s) => selectIsTokenHidden(s, tokenId))
  // const explorerUrl = useAppSelector((s) => s.network.settings.explorerUrl)

  const options: Array<DropdownOption> = useMemo(
    () => [
      // {
      //   label: t('Show in explorer'),
      //   onClick: () => {
      //     // TODO: Add link to explorer when explorer supports token page
      //     openInWebBrowser(`${explorerUrl}/token/${tokenId}`)
      //   }
      // },
      {
        label: t(isTokenHidden ? 'Unhide asset' : 'Hide asset'),
        onClick: () => {
          dispatch(isTokenHidden ? unhideToken(tokenId) : hideToken(tokenId))
          sendAnalytics({ event: 'Hid token', props: { tokenId } })
        }
      }
    ],
    [dispatch, isTokenHidden, sendAnalytics, t, tokenId]
  )

  return <DropdownButton options={options} Icon={MoreVertical} circle tiny role="secondary" />
}

export default TokenDropdownOptions
