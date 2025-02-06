import { useCallback, useRef, useState } from 'react'

import { Coordinates } from '@/types/numbers'

const useHookCoordinates = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hookCoordinates, setHookCoordinates] = useState<Coordinates | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = useCallback(() => {
    setHookCoordinates(() => {
      if (containerRef?.current) {
        const containerElement = containerRef.current
        const containerElementRect = containerElement.getBoundingClientRect()

        return {
          x: containerElementRect.x + containerElement.clientWidth / 2,
          y: containerElementRect.y + containerElement.clientHeight / 2
        }
      }
    })
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    containerRef.current?.focus()
  }, [])

  return {
    containerRef,
    hookCoordinates,
    isModalOpen,
    openModal,
    closeModal
  }
}

export default useHookCoordinates
