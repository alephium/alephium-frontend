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

import { ReactElement } from 'react'
import { Dimensions, StyleProp, View, ViewProps } from 'react-native'
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import RNCarousel from 'react-native-reanimated-carousel'
import styled, { useTheme } from 'styled-components/native'

interface CarouselProps<T> {
  data: Array<T>
  renderItem: (itemInfo: { item: T }) => ReactElement
  width?: number
  height?: number
  onScrollStart?: () => void
  onScrollEnd?: (index: number) => void
}

function Carousel<T>({ data, renderItem, width, height, onScrollStart, onScrollEnd }: CarouselProps<T>) {
  const progressValue = useSharedValue<number>(0)
  const theme = useTheme()

  const defaultWidth = Dimensions.get('window').width

  return (
    <View>
      <RNCarousel
        style={{
          width: '100%',
          justifyContent: 'center'
        }}
        width={width ?? defaultWidth}
        height={165}
        loop={false}
        onProgressChange={(_, absoluteProgress) => (progressValue.value = absoluteProgress)}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: -17
        }}
        data={data}
        renderItem={renderItem}
        onScrollBegin={onScrollStart}
        onScrollEnd={onScrollEnd}
      />
      {!!progressValue && (
        <CarouselPagination>
          {data.map((item, index) => {
            return (
              <CarouselPaginationItem
                backgroundColor={theme.font.primary}
                animValue={progressValue}
                index={index}
                key={index}
                length={data.length}
              />
            )
          })}
        </CarouselPagination>
      )}
    </View>
  )
}

export default Carousel

const CarouselPagination = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100px;
  align-self: center;
  margin-top: 36px;
`

interface CarouselPaginationItemProps {
  index: number
  backgroundColor: string
  length: number
  animValue: Animated.SharedValue<number>
  size?: number
  style?: StyleProp<ViewProps>
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
    <Circle style={style} size={size}>
      <Dot style={animStyle} size={size - 3} />
    </Circle>
  )
}

const Circle = styled.View<{ size: number }>`
  background-color: ${({ theme }) => theme.font.contrast};
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  border-width: 1px;
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
