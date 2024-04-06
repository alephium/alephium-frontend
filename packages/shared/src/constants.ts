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

export const NUM_OF_ZEROS_IN_QUINTILLION = 18

export const MINIMAL_GAS_AMOUNT = 20000

export const MINIMAL_GAS_PRICE = BigInt(100000000000) // 100 nanoALPH for the first year to prevent DoS attacks

export const GENESIS_TIMESTAMP = 1231006505000

export const CHART_DATE_FORMAT = 'YYYY-MM-DD'

export enum WALLETCONNECT_ERRORS {
  TRANSACTION_SEND_FAILED = -32000,
  PARSING_SESSION_REQUEST_FAILED = -33000,
  TRANSACTION_BUILD_FAILED = -34000,
  TRANSACTION_SIGN_FAILED = -35000,
  MESSAGE_SIGN_FAILED = -36000,
  SIGNER_ADDRESS_DOESNT_EXIST = -37000,
  TRANSACTION_DECODE_FAILED = -38000
}

export const PRICES_REFRESH_INTERVAL = 60000

export const TRANSACTIONS_REFRESH_INTERVAL = 10000

// TIME

export const ONE_MINUTE_MS = 1000 * 60

export const FIVE_MINUTES_MS = 5 * ONE_MINUTE_MS

export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS

export const ONE_DAY_MS = 24 * ONE_HOUR_MS
