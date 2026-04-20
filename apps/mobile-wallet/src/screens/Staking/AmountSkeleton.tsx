import { colord } from 'colord'
import { Skeleton } from 'moti/skeleton'
import { useMemo } from 'react'
import { useTheme } from 'styled-components/native'

interface AmountSkeletonProps {
  height: number
}

const AmountSkeleton = ({ height }: AmountSkeletonProps) => {
  const theme = useTheme()

  const skeletonColors = useMemo(() => {
    const base = colord(theme.global.palette3)
    const dim = base.darken(0.01)
    const bright = base.lighten(0.06)

    return [dim.toHex(), bright.toHex(), bright.toHex(), dim.toHex()]
  }, [theme.global.palette3])

  return <Skeleton height={height} width={100} backgroundColor={theme.global.palette3} colors={skeletonColors} />
}

export default AmountSkeleton
