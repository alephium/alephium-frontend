export const shouldSkip = (isServerOnline: boolean, skip?: boolean) => skip === true || !isServerOnline
