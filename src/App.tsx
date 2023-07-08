/*
Copyright 2018 - 2022 The Alephium Authors
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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import { AnimateSharedLayout } from 'framer-motion'
import { Route, Routes, useNavigate } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'

import AppFooter from '@/components/AppFooter'
import AppHeader from '@/components/AppHeader'
import PageNotFound from '@/pages/404'
import AddressInfoSection from '@/pages/AddressInfoPage'
import BlockInfoSection from '@/pages/BlockInfoPage'
import HomeSection from '@/pages/HomePage/HomePage'
import TransactionInfoSection from '@/pages/TransactionInfoPage'
import GlobalStyle, { deviceBreakPoints } from '@/styles/globalStyles'
import { darkTheme, lightTheme } from '@/styles/themes'

import { SnackbarProvider } from './components/Snackbar/SnackbarProvider'
import { useAppSelector } from './hooks/redux'

/* Customize data format accross the app */
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'A few secs',
    m: 'A min',
    mm: '%d mins',
    h: 'An hour',
    hh: '%d hours',
    d: 'A day',
    dd: '%d days',
    M: 'A month',
    MM: '%d months',
    y: 'A year',
    yy: '%d years'
  }
})

const App = () => {
  const theme = useAppSelector((s) => s.settings.theme)
  const navigate = useNavigate()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 5000 // default ms before cache data is considered stale
      }
    }
  })

  // Ensure that old HashRouter URLs get converted to BrowserRouter URLs
  if (location.hash.startsWith('#/')) navigate(location.hash.replace('#', ''))

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <GlobalStyle />
          <MainContainer>
            <AnimateSharedLayout>
              <AppHeader />
              <ContentContainer>
                <ContentWrapper>
                  <Content>
                    <Routes>
                      <Route path="/" element={<HomeSection />} />
                      <Route path="/blocks/:id" element={<BlockInfoSection />} />
                      <Route path="/addresses/:id" element={<AddressInfoSection />} />
                      <Route path="/transactions/:id" element={<TransactionInfoSection />} />
                      <Route path="*" element={<PageNotFound />} />
                    </Routes>
                  </Content>
                </ContentWrapper>
              </ContentContainer>
            </AnimateSharedLayout>
            <AppFooter />
            <SnackbarAnchor id="snackbar-anchor" />
          </MainContainer>
          <Background />
        </SnackbarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App

const MainContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
`

const Background = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: -2;
  background-color: ${({ theme }) => theme.bg.background1};
`

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 35px min(5vw, 50px) 0;
`

const ContentWrapper = styled.main`
  min-height: 100%;
  flex: 1 1 1200px;
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 1200px;

  @media ${deviceBreakPoints.tablet} {
    width: 100%;
    justify-self: flex-start;
  }
`

const Content = styled.div`
  flex: 1;
  display: flex;
  margin-bottom: 40px;
`

const SnackbarAnchor = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`
