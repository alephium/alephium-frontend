/*
Copyright 2018 - 2024 The Alephium Authors
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

import { addApostrophes } from '@alephium/shared'
import { animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface CounterProps {
  from?: number
  to: number
}

const Counter = ({ from, to }: CounterProps) => {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const previousTargetValue = useRef(0)

  useEffect(() => {
    const node = nodeRef.current

    const handle = animate(from || previousTargetValue.current, to, {
      duration: 1,
      onUpdate(value) {
        if (node) {
          node.textContent = addApostrophes(value.toFixed(0))
          previousTargetValue.current = to
        }
      }
    })

    return () => handle.stop()
  }, [from, to])

  return <span ref={nodeRef} />
}

export default Counter
