// The transaction from issue #1563 ("This page needs more calzone"), mined 8 Dec 2021.
export const CALZONE_TX_HASH = 'dd0ac16e9246db90b5d3b2878d8dee9321ac69f07131ab80c19a56d5b178068d'

// December 8th, the day the transaction above was mined.
export const isCalzoneDay = (date = new Date()) => date.getMonth() === 11 && date.getDate() === 8
