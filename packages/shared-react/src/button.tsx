import { useEffect } from 'react'

export interface SharedButtonProps {
  text: string
  onClick?: () => void
}

export const SharedButton = ({ text, onClick }: SharedButtonProps) => {
  useEffect(() => {
    console.log('Hello from shared-react package!')
  }, [])

  return <button onClick={onClick}>{text}</button>
}
