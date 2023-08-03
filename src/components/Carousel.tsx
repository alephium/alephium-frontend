/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'
import { Dimensions, LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native'
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import RNCarousel, { ICarouselInstance } from 'react-native-reanimated-carousel'
import styled, { useTheme } from 'styled-components/native'

import { ScreenSection } from '~/components/layout/Screen'

interface CarouselProps<T> {
  data: Array<T>
  renderItem: (itemInfo: { item: T }) => ReactElement
  width?: number
  padding?: number
  height?: number
  distance?: number
  onScrollStart?: () => void
  onScrollEnd?: (index: number) => void
  FooterComponent?: ReactNode
  style?: StyleProp<ViewStyle>
  scrollTo?: number
}

const Carousel = <T,>({
  data,
  renderItem,
  width,
  height,
  padding = 0,
  distance = 0,
  onScrollStart,
  onScrollEnd,
  FooterComponent,
  style,
  scrollTo
}: CarouselProps<T>) => {
  const progressValue = useSharedValue<number>(0)
  const theme = useTheme()
  const ref = useRef<ICarouselInstance>(null)

  const [_width, setWidth] = useState(width ?? Dimensions.get('window').width - padding * 2)

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(width ?? event.nativeEvent.layout.width - padding * 2)
  }

  useEffect(() => {
    if (scrollTo !== undefined) {
      ref.current?.scrollTo({ index: scrollTo })
    }
  }, [scrollTo])

  return (
    <View onLayout={onLayout} style={style}>
      <RNCarousel
        ref={ref}
        style={{ width: '100%', justifyContent: 'center' }}
        width={_width}
        height={height}
        loop={false}
        onProgressChange={(_, absoluteProgress) => (progressValue.value = absoluteProgress)}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: distance * -1
        }}
        data={data}
        renderItem={renderItem}
        onScrollBegin={onScrollStart}
        onScrollEnd={onScrollEnd}
      />
      <CarouselFooter centered={!FooterComponent}>
        {!!progressValue && data.length > 1 && (
          <CarouselPagination>
            {data.map((_, index) => (
              <CarouselPaginationItem
                backgroundColor={theme.font.primary}
                animValue={progressValue}
                index={index}
                key={`pagination-${index}`}
                length={data.length}
                size={6}
              />
            ))}
          </CarouselPagination>
        )}
        {FooterComponent}
      </CarouselFooter>
    </View>
  )
}

export default Carousel

const CarouselPagination = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  flex-shrink: 1;
  align-self: center;
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 11px 14px;
  border-radius: 100px;
  gap: 9px;
`

const CarouselFooter = styled(ScreenSection)<{ centered?: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: ${({ centered }) => (centered ? 'center' : 'space-between')};
`

interface CarouselPaginationItemProps {
  index: number
  backgroundColor: string
  length: number
  animValue: Animated.SharedValue<number>
  size?: number
  style?: StyleProp<ViewStyle>
}

const CarouselPaginationItem = ({ animValue, index, length, size = 12, style }: CarouselPaginationItemProps) => {
  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1]
    let outputRange = [-size, 0, size]

    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1]
      outputRange = [-size, 0, size]
    }

    return {
      transform: [
        {
          translateX: interpolate(animValue?.value, inputRange, outputRange, Extrapolate.CLAMP)
        }
      ]
    }
  }, [animValue, index, length])

  return (
    <Circle style={style} size={size} isLast={index === length - 1}>
      <Dot style={animStyle} size={size} />
    </Circle>
  )
}

const Circle = styled.View<{ size: number; isLast: boolean }>`
  background-color: ${({ theme }) => theme.font.tertiary};
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  border-color: ${({ theme }) => theme.font.tertiary};
  overflow: hidden;
  align-items: center;
  justify-content: center;
`

const Dot = styled(Animated.View)<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  background-color: ${({ theme }) => theme.font.primary};
`
