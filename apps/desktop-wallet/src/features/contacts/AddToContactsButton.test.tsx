import '@/features/localization/i18n'

import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import AddToContactsButton from '@/features/contacts/AddToContactsButton'
import { lightTheme } from '@/features/theme/themes'

const walletAddressHash = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
const contactAddressHash = '15qNxou4d5AnPkTgS93xezWpSyZgqegNjjf41QoMqi5Bc'
const unknownAddressHash = '17ZWfBTAV6Aji5UjzbHXWAyaVGxsvKe5dEbAcXHfcTb15'

const renderButton = (addressHash: string) => {
  const state = {
    addresses: { ids: [walletAddressHash], entities: { [walletAddressHash]: { hash: walletAddressHash } } },
    contacts: {
      ids: ['contact-1'],
      entities: { 'contact-1': { id: 'contact-1', name: 'Alice', address: contactAddressHash } }
    }
  }
  const store = configureStore({ reducer: () => state })

  return render(
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <AddToContactsButton addressHash={addressHash} />
      </ThemeProvider>
    </Provider>
  )
}

describe('AddToContactsButton', () => {
  it('offers to save an address that is neither owned nor a known contact', () => {
    renderButton(unknownAddressHash)

    expect(screen.queryByText('Add to contacts')).toBeInTheDocument()
  })

  it('renders nothing for one of the wallet own addresses', () => {
    renderButton(walletAddressHash)

    expect(screen.queryByText('Add to contacts')).not.toBeInTheDocument()
  })

  it('renders nothing for an address that is already a contact', () => {
    renderButton(contactAddressHash)

    expect(screen.queryByText('Add to contacts')).not.toBeInTheDocument()
  })

  it('ignores the group suffix of a groupless address', () => {
    renderButton(`${walletAddressHash}:1`)

    expect(screen.queryByText('Add to contacts')).not.toBeInTheDocument()
  })
})
