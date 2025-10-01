import { hideToken, selectIsTokenHidden, unhideToken } from '@alephium/shared'
import { useAddressExplorerLink } from '@alephium/shared-react'
import { addressFromTokenId } from '@alephium/web3'
import { MoreVertical } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import DropdownButton, { DropdownOption } from '@/components/DropdownButton'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'
import { openInWebBrowser } from '@/utils/misc'

const TokenDropdownOptions = ({ tokenId }: TokenDetailsModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()
  const isTokenHidden = useAppSelector((s) => selectIsTokenHidden(s, tokenId))
  const addressExplorerUrl = useAddressExplorerLink(addressFromTokenId(tokenId))

  const options: Array<DropdownOption> = useMemo(
    () => [
      {
        label: t('Show in explorer'),
        onClick: () => openInWebBrowser(addressExplorerUrl)
      },
      {
        label: t(isTokenHidden ? 'Unhide asset' : 'Hide asset'),
        onClick: () => {
          dispatch(isTokenHidden ? unhideToken(tokenId) : hideToken(tokenId))
          sendAnalytics({ event: 'Hid token', props: { tokenId } })
        }
      }
    ],
    [addressExplorerUrl, dispatch, isTokenHidden, sendAnalytics, t, tokenId]
  )

  return <DropdownButton options={options} Icon={MoreVertical} circle tiny role="secondary" />
}

export default TokenDropdownOptions
