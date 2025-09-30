import { createContext, ReactNode, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type RouteParams = {
  step: string | undefined
}

interface StepsContext {
  onButtonNext: () => void
  onButtonBack: () => void
}
const initialContext: StepsContext = {
  onButtonNext: () => null,
  onButtonBack: () => null
}

export const StepsContext = createContext<StepsContext>(initialContext)

interface StepsContextProviderProps {
  stepElements: ReactNode[]
  baseUrl: string
}

export const StepsContextProvider: FC<StepsContextProviderProps> = ({ baseUrl, stepElements, children }) => {
  const navigate = useNavigate()
  const { step } = useParams<RouteParams>()

  const onButtonNext = () => {
    window.scrollTo(0, 0)
    navigate(`/${baseUrl}/${stepNumber + 1}`)
  }
  const onButtonBack = () => {
    window.scrollTo(0, 0)
    if (stepNumber === 0) {
      navigate('/')
    } else {
      navigate(`/${baseUrl}/${stepNumber - 1}`)
    }
  }

  // Steps management
  const stepNumber = step ? parseInt(step) : 0

  // Redirect if step not set properly
  if (stepNumber > stepElements.length) {
    navigate(`/${baseUrl}/${stepElements.length - 1}`, { replace: true })
  }

  const isStepNumberCorrect = stepNumber >= 0 && stepNumber < stepElements.length

  return (
    <StepsContext.Provider value={{ onButtonNext, onButtonBack }}>
      {isStepNumberCorrect && stepElements[stepNumber]}
      {children}
    </StepsContext.Provider>
  )
}

export const useStepsContext = () => useContext(StepsContext)
