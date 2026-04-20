import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import useFetchXAlphRate from '~/features/staking/hooks/useFetchXAlphRate'
import { previewXAlphForStake } from '~/features/staking/stakingUtils'

interface StakeModalReceivePreviewProps {
  alphAmount: bigint
}

const StakeModalReceivePreview = ({ alphAmount }: StakeModalReceivePreviewProps) => {
  const { t } = useTranslation()
  const { data: xAlphRate } = useFetchXAlphRate()

  const xAlphToReceive = useMemo(
    () => (alphAmount ? previewXAlphForStake(alphAmount, xAlphRate) : ''),
    [alphAmount, xAlphRate]
  )

  if (!xAlphToReceive) return null

  return (
    <Trans
      t={t}
      i18nKey="stakeXAlphReceivePreview"
      values={{ amount: xAlphToReceive }}
      components={{
        1: <AppText color="secondary" size={13} />,
        2: <AppText semiBold size={18} />
      }}
    >
      {'<1>You will receive</1><2>≈ {{amount}} xALPH</2>'}
    </Trans>
  )
}

export default StakeModalReceivePreview
