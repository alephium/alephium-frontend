const transition = { duration: 0.3 }

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition
}

export const fadeOut = {
  exit: { opacity: 0 },
  transition
}

export const fadeInOut = {
  ...fadeIn,
  ...fadeOut
}

export const fadeInBottom = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition
}

export const slowTransition = {
  transition: { duration: 0.8 }
}

export const normalTransition = {
  transition: { type: 'spring', damping: 50, stiffness: 400 }
}

export const fastTransition = {
  transition: { type: 'spring', damping: 40, stiffness: 500 }
}

export const fadeInSlowly = {
  ...fadeIn,
  ...slowTransition
}

export const fadeOutFast = {
  ...fadeOut,
  ...fastTransition
}

export const fadeInOutFast = {
  ...fadeInOut,
  ...fastTransition
}

export const fadeInOutScaleFast = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  ...fastTransition
}
