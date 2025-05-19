import { isValidAddress } from '@alephium/web3'

import i18n from '~/features/localization/i18n'

export const validateIsAddressValid = (value: string) => isValidAddress(value) || i18n.t('This address is not valid')
