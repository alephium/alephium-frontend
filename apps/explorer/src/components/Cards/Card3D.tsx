import { motion, Transition, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { PointerEvent, ReactNode, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import { getPointerRelativePositionInElement } from '@/utils/inputs'

interface Card3DProps {
  frontFace: ReactNode
  backFace?: ReactNode
  onClick?: () => void
  onPointerMove?: (pointerX: number, pointerY: number) => void
  onCardHover?: (isHovered: boolean) => void
  onCardFlip?: (isFlipped: boolean) => void
  className?: string
}

export const card3DHoverTransition: Transition = {
  type: 'spring',
  stiffness: 1000,
  damping: 100
}

const Card3D = ({ frontFace, backFace, onClick, onPointerMove, onCardFlip, onCardHover, className }: Card3DProps) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const angle = 10

  const y = useMotionValue(0.5)
  const x = useMotionValue(0.5)

  const springConfig = { damping: 10, stiffness: 100 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const rotateY = useTransform(xSpring, [0, 1], [-angle, angle], {
    clamp: true
  })
  const rotateX = useTransform(ySpring, [0, 1], [angle, -angle], {
    clamp: true
  })

  const reflectionTranslationX = useTransform(xSpring, [0, 1], [angle * 1.5, -angle * 1.5], {
    clamp: true
  })

  const reflectionTranslationY = useTransform(ySpring, [0, 1], [angle * 3, -angle * 3], {
    clamp: true
  })

  const handleClick = () => {
    if (onClick) onClick()
    if (backFace) {
      setIsFlipped((p) => !p)
    }
  }

  const handlePointerMove = (e: PointerEvent) => {
    const { x: positionX, y: positionY } = getPointerRelativePositionInElement(e)

    x.set(positionX, true)
    y.set(isFlipped ? 1 - positionY : positionY, true)

    onPointerMove && onPointerMove(positionX, positionY)
  }

  useEffect(() => {
    onCardFlip && onCardFlip(isFlipped)
  }, [isFlipped, onCardFlip])

  useEffect(() => {
    onCardHover && onCardHover(isHovered)
  }, [isHovered, onCardHover])

  return (
    <Card3DStyled
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false)
        setIsFlipped(false)
        x.set(0.5, true)
        y.set(0.5, true)
      }}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ zIndex: 3, cursor: 'pointer' }}
    >
      <FlippingContainer
        animate={{
          rotateY: isFlipped ? 180 : 0,
          translateZ: isHovered ? 100 : 0
        }}
        transition={card3DHoverTransition}
      >
        <CardContainer
          className={className}
          style={{
            rotateY,
            rotateX,
            zIndex: 0,
            boxShadow: '0 2px 2px rgba(0, 0, 0, 0.05)'
          }}
          animate={{
            boxShadow: isHovered
              ? theme.name === 'light'
                ? '0 20px 40px rgba(0, 0, 0, 0.4)'
                : '0 20px 40px rgba(0, 0, 0, 0.8)'
              : undefined
          }}
        >
          <FrontFaceContainer>{frontFace}</FrontFaceContainer>
          {backFace && <BackFaceContainer>{backFace}</BackFaceContainer>}
          <ReflectionClipper style={{ transform: isFlipped ? 'rotateY(180deg) rotateX(180deg)' : undefined }}>
            <MovingReflection
              style={{ translateX: reflectionTranslationX, translateY: reflectionTranslationY, opacity: 0 }}
              animate={{ opacity: isHovered ? (theme.name === 'dark' ? 0.3 : 1) : 0 }}
            />
          </ReflectionClipper>
        </CardContainer>
      </FlippingContainer>
    </Card3DStyled>
  )
}

const Card3DStyled = styled(motion.div)`
  position: relative;
  perspective: 1000px;
`

const FlippingContainer = styled(motion.div)`
  transform-style: preserve-3d;
`

const CardContainer = styled(motion.div)`
  position: relative;
  height: 205px;
  transform-style: preserve-3d;
  flex: 1;

  border-style: solid;
  border-width: 1px;
  background-color: ${({ theme }) => theme.bg.primary};

  border-color: ${({ theme }) => theme.border.secondary};
`

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
`

const FrontFaceContainer = styled(CardFace)``

const BackFaceContainer = styled(CardFace)`
  transform: rotateY(180deg);
`
const ReflectionClipper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const MovingReflection = styled(motion.div)`
  position: absolute;
  background: linear-gradient(
    60deg,
    transparent 40%,
    rgba(255, 255, 255, 0.3) 70%,
    rgba(255, 255, 255, 0.3) 80%,
    transparent 90%
  );
  pointer-events: none;

  inset: -50px;
  z-index: 10;
`

export default Card3D
