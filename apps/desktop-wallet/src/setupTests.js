// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

import '@testing-library/jest-dom'
import './tests/api/setup'

import { ThemeConsumer } from 'styled-components'

import { lightTheme } from './features/theme/themes'

beforeEach(() => {
  ThemeConsumer._currentValue = lightTheme // Make `theme` prop available in all components
})
