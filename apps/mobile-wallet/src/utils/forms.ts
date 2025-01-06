import { isValidAddress } from '@alephium/web3'

import i18n from '~/features/localization/i18n'
import { isNumericStringValid } from '~/utils/numbers'

export const validateIsAddressValid = (value: string) => isValidAddress(value) || i18n.t('This address is not valid')

export const validateIsNumericStringValid = (value: string) =>
  isNumericStringValid(value) || i18n.t('A number is expected')

export const validateOptionalIsNumericStringValid = (value: string) => !value || validateIsNumericStringValid(value)
