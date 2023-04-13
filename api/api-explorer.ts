/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AcceptedTransaction {
  /** @format 32-byte-hash */
  hash: string
  /** @format block-hash */
  blockHash: string
  /** @format int64 */
  timestamp: number
  inputs?: Input[]
  outputs?: Output[]
  /** @format int32 */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  scriptExecutionOk: boolean
  coinbase: boolean
  type: string
}

export interface AddressBalance {
  /** @format uint256 */
  balance: string
  /** @format uint256 */
  lockedBalance: string
}

export interface AddressInfo {
  /** @format uint256 */
  balance: string
  /** @format uint256 */
  lockedBalance: string
  /** @format int32 */
  txNumber: number
}

export interface AssetOutput {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
  /** @format uint256 */
  attoAlphAmount: string
  /** @format address */
  address: string
  tokens?: Token[]
  /** @format int64 */
  lockTime?: number
  /** @format hex-string */
  message?: string
  /** @format 32-byte-hash */
  spent?: string
  type: string
}

export interface BadRequest {
  detail: string
}

export interface BlockEntryLite {
  /** @format block-hash */
  hash: string
  /** @format int64 */
  timestamp: number
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  /** @format int32 */
  height: number
  /** @format int32 */
  txNumber: number
  mainChain: boolean
  /** @format bigint */
  hashRate: string
}

export interface ContractOutput {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
  /** @format uint256 */
  attoAlphAmount: string
  /** @format address */
  address: string
  tokens?: Token[]
  /** @format 32-byte-hash */
  spent?: string
  type: string
}

export interface ContractParent {
  /** @format address */
  parent?: string
}

export interface Event {
  /** @format block-hash */
  blockHash: string
  /** @format 32-byte-hash */
  txHash: string
  /** @format address */
  contractAddress: string
  /** @format address */
  inputAddress?: string
  /** @format int32 */
  eventIndex: number
  fields?: Val[]
}

export interface ExplorerInfo {
  releaseVersion: string
  commit: string
}

export interface Hashrate {
  /** @format int64 */
  timestamp: number
  hashrate: number
  value: number
}

export interface Input {
  outputRef: OutputRef
  /** @format hex-string */
  unlockScript?: string
  /** @format 32-byte-hash */
  txHashRef?: string
  /** @format address */
  address?: string
  /** @format uint256 */
  attoAlphAmount?: string
  tokens?: Token[]
}

export interface InternalServerError {
  detail: string
}

export enum IntervalType {
  Daily = 'daily',
  Hourly = 'hourly'
}

export interface ListBlocks {
  /** @format int32 */
  total: number
  blocks?: BlockEntryLite[]
}

export interface LogbackValue {
  name: string
  level: string
}

export interface MempoolTransaction {
  /** @format 32-byte-hash */
  hash: string
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  inputs?: Input[]
  outputs?: Output[]
  /** @format int32 */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  /** @format int64 */
  lastSeen: number
}

export interface NotFound {
  detail: string
  resource: string
}

export type Output = AssetOutput | ContractOutput

export interface OutputRef {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
}

export interface PendingTransaction {
  /** @format 32-byte-hash */
  hash: string
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  inputs?: Input[]
  outputs?: Output[]
  /** @format int32 */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  /** @format int64 */
  lastSeen: number
  type: string
}

export interface PerChainCount {
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  /** @format int64 */
  count: number
}

export interface PerChainDuration {
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  /** @format int64 */
  duration: number
  /** @format int64 */
  value: number
}

export interface PerChainHeight {
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  /** @format int64 */
  height: number
  /** @format int64 */
  value: number
}

export interface PerChainTimedCount {
  /** @format int64 */
  timestamp: number
  totalCountPerChain?: PerChainCount[]
}

export interface ServiceUnavailable {
  detail: string
}

export interface SubContracts {
  subContracts?: string[]
}

export interface TimedCount {
  /** @format int64 */
  timestamp: number
  /** @format int64 */
  totalCountAllChains: number
}

export interface Token {
  /** @format 32-byte-hash */
  id: string
  /** @format uint256 */
  amount: string
}

export interface TokenSupply {
  /** @format int64 */
  timestamp: number
  /** @format uint256 */
  total: string
  /** @format uint256 */
  circulating: string
  /** @format uint256 */
  reserved: string
  /** @format uint256 */
  locked: string
  /** @format uint256 */
  maximum: string
}

export interface Transaction {
  /** @format 32-byte-hash */
  hash: string
  /** @format block-hash */
  blockHash: string
  /** @format int64 */
  timestamp: number
  inputs?: Input[]
  outputs?: Output[]
  /** @format int32 */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  scriptExecutionOk: boolean
  coinbase: boolean
}

export type TransactionLike = AcceptedTransaction | PendingTransaction

export interface Unauthorized {
  detail: string
}

export type Val = ValAddress | ValArray | ValBool | ValByteVec | ValI256 | ValU256

export interface ValAddress {
  /** @format address */
  value: string
  type: string
}

export interface ValArray {
  value: Val[]
  type: string
}

export interface ValBool {
  value: boolean
  type: string
}

export interface ValByteVec {
  /** @format hex-string */
  value: string
  type: string
}

export interface ValI256 {
  /** @format bigint */
  value: string
  type: string
}

export interface ValU256 {
  /** @format uint256 */
  value: string
  type: string
}

import 'cross-fetch/polyfill'

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain'
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = ''
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key])
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`
        )
        return formData
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input)
  }

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {})
      }
    }
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {})
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body)
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch((e) => {
              r.error = e
              return r
            })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      if (!response.ok) throw data
      return data
    })
  }
}

/**
 * @title Alephium Explorer API
 * @version 1.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  blocks = {
    /**
     * @description List latest blocks
     *
     * @tags Blocks
     * @name GetBlocks
     * @request GET:/blocks
     */
    getBlocks: (
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<ListBlocks, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blocks`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description Get a block with hash
     *
     * @tags Blocks
     * @name GetBlocksBlockHash
     * @request GET:/blocks/{block_hash}
     */
    getBlocksBlockHash: (blockHash: string, params: RequestParams = {}) =>
      this.request<BlockEntryLite, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blocks/${blockHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description Get block's transactions
     *
     * @tags Blocks
     * @name GetBlocksBlockHashTransactions
     * @request GET:/blocks/{block_hash}/transactions
     */
    getBlocksBlockHashTransactions: (
      blockHash: string,
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blocks/${blockHash}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      })
  }
  transactions = {
    /**
     * @description Get a transaction with hash
     *
     * @tags Transactions
     * @name GetTransactionsTransactionHash
     * @request GET:/transactions/{transaction_hash}
     */
    getTransactionsTransactionHash: (transactionHash: string, params: RequestParams = {}) =>
      this.request<TransactionLike, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/${transactionHash}`,
        method: 'GET',
        format: 'json',
        ...params
      })
  }
  addresses = {
    /**
     * @description Get address information
     *
     * @tags Addresses
     * @name GetAddressesAddress
     * @request GET:/addresses/{address}
     */
    getAddressesAddress: (address: string, params: RequestParams = {}) =>
      this.request<AddressInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description List transactions of a given address
     *
     * @tags Addresses
     * @name GetAddressesAddressTransactions
     * @request GET:/addresses/{address}/transactions
     */
    getAddressesAddressTransactions: (
      address: string,
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description List transactions for given addresses
     *
     * @tags Addresses
     * @name PostAddressesTransactions
     * @request POST:/addresses/transactions
     */
    postAddressesTransactions: (
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      data?: string[],
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/transactions`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * @description List transactions of a given address within a time-range
     *
     * @tags Addresses
     * @name GetAddressesAddressTimerangedTransactions
     * @request GET:/addresses/{address}/timeranged-transactions
     */
    getAddressesAddressTimerangedTransactions: (
      address: string,
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/timeranged-transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description Get total transactions of a given address
     *
     * @tags Addresses
     * @name GetAddressesAddressTotalTransactions
     * @request GET:/addresses/{address}/total-transactions
     */
    getAddressesAddressTotalTransactions: (address: string, params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/total-transactions`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description List mempool transactions of a given address
     *
     * @tags Addresses
     * @name GetAddressesAddressMempoolTransactions
     * @request GET:/addresses/{address}/mempool/transactions
     */
    getAddressesAddressMempoolTransactions: (address: string, params: RequestParams = {}) =>
      this.request<
        MempoolTransaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/addresses/${address}/mempool/transactions`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description Get address balance
     *
     * @tags Addresses
     * @name GetAddressesAddressBalance
     * @request GET:/addresses/{address}/balance
     */
    getAddressesAddressBalance: (address: string, params: RequestParams = {}) =>
      this.request<AddressBalance, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/balance`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description List address tokens
     *
     * @tags Addresses
     * @name GetAddressesAddressTokens
     * @request GET:/addresses/{address}/tokens
     */
    getAddressesAddressTokens: (
      address: string,
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<string[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/tokens`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description List address tokens
     *
     * @tags Addresses
     * @name GetAddressesAddressTokensTokenIdTransactions
     * @request GET:/addresses/{address}/tokens/{token_id}/transactions
     */
    getAddressesAddressTokensTokenIdTransactions: (
      address: string,
      tokenId: string,
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/tokens/${tokenId}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description Get address balance of given token
     *
     * @tags Addresses
     * @name GetAddressesAddressTokensTokenIdBalance
     * @request GET:/addresses/{address}/tokens/{token_id}/balance
     */
    getAddressesAddressTokensTokenIdBalance: (address: string, tokenId: string, params: RequestParams = {}) =>
      this.request<AddressBalance, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/tokens/${tokenId}/balance`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description Are the addresses used (at least 1 transaction)
     *
     * @tags Addresses, Addresses
     * @name PostAddressesUsed
     * @request POST:/addresses/used
     */
    postAddressesUsed: (data?: string[], params: RequestParams = {}) =>
      this.request<boolean[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/used`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressExportTransactionsCsv
     * @request GET:/addresses/{address}/export-transactions/csv
     */
    getAddressesAddressExportTransactionsCsv: (
      address: string,
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
      },
      params: RequestParams = {}
    ) =>
      this.request<string, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/export-transactions/csv`,
        method: 'GET',
        query: query,
        ...params
      }),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressAmountHistory
     * @request GET:/addresses/{address}/amount-history
     */
    getAddressesAddressAmountHistory: (
      address: string,
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        'interval-type': IntervalType
      },
      params: RequestParams = {}
    ) =>
      this.request<string, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/amount-history`,
        method: 'GET',
        query: query,
        ...params
      })
  }
  infos = {
    /**
     * @description Get explorer informations
     *
     * @tags Infos
     * @name GetInfos
     * @request GET:/infos
     */
    getInfos: (params: RequestParams = {}) =>
      this.request<ExplorerInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description List latest height for each chain
     *
     * @tags Infos
     * @name GetInfosHeights
     * @request GET:/infos/heights
     */
    getInfosHeights: (params: RequestParams = {}) =>
      this.request<PerChainHeight[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/heights`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description Get token supply list
     *
     * @tags Infos
     * @name GetInfosSupply
     * @request GET:/infos/supply
     */
    getInfosSupply: (
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<TokenSupply[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/supply`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description Get the ALPH total supply
     *
     * @tags Infos
     * @name GetInfosSupplyTotalAlph
     * @request GET:/infos/supply/total-alph
     */
    getInfosSupplyTotalAlph: (params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/supply/total-alph`,
        method: 'GET',
        ...params
      }),

    /**
     * @description Get the ALPH circulating supply
     *
     * @tags Infos
     * @name GetInfosSupplyCirculatingAlph
     * @request GET:/infos/supply/circulating-alph
     */
    getInfosSupplyCirculatingAlph: (params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/supply/circulating-alph`,
        method: 'GET',
        ...params
      }),

    /**
     * @description Get the ALPH reserved supply
     *
     * @tags Infos
     * @name GetInfosSupplyReservedAlph
     * @request GET:/infos/supply/reserved-alph
     */
    getInfosSupplyReservedAlph: (params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/supply/reserved-alph`,
        method: 'GET',
        ...params
      }),

    /**
     * @description Get the ALPH locked supply
     *
     * @tags Infos
     * @name GetInfosSupplyLockedAlph
     * @request GET:/infos/supply/locked-alph
     */
    getInfosSupplyLockedAlph: (params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/supply/locked-alph`,
        method: 'GET',
        ...params
      }),

    /**
     * @description Get the total number of transactions
     *
     * @tags Infos
     * @name GetInfosTotalTransactions
     * @request GET:/infos/total-transactions
     */
    getInfosTotalTransactions: (params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/total-transactions`,
        method: 'GET',
        ...params
      }),

    /**
     * @description Get the average block time for each chain
     *
     * @tags Infos
     * @name GetInfosAverageBlockTimes
     * @request GET:/infos/average-block-times
     */
    getInfosAverageBlockTimes: (params: RequestParams = {}) =>
      this.request<PerChainDuration[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>(
        {
          path: `/infos/average-block-times`,
          method: 'GET',
          format: 'json',
          ...params
        }
      )
  }
  mempool = {
    /**
     * @description list mempool transactions
     *
     * @tags Mempool
     * @name GetMempoolTransactions
     * @request GET:/mempool/transactions
     */
    getMempoolTransactions: (
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<
        MempoolTransaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/mempool/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      })
  }
  tokens = {
    /**
     * @description List tokens
     *
     * @tags Tokens
     * @name GetTokens
     * @request GET:/tokens
     */
    getTokens: (
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<string[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/tokens`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description List token transactions
     *
     * @tags Tokens
     * @name GetTokensTokenIdTransactions
     * @request GET:/tokens/{token_id}/transactions
     */
    getTokensTokenIdTransactions: (
      tokenId: string,
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/tokens/${tokenId}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      })
  }
  charts = {
    /**
     * @description `interval-type` query param: hourly, daily
     *
     * @tags Charts
     * @name GetChartsHashrates
     * @summary Get hashrate chart in H/s
     * @request GET:/charts/hashrates
     */
    getChartsHashrates: (
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        'interval-type': IntervalType
      },
      params: RequestParams = {}
    ) =>
      this.request<Hashrate[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/charts/hashrates`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description `interval-type` query param: hourly, daily
     *
     * @tags Charts
     * @name GetChartsTransactionsCount
     * @summary Get transaction count history
     * @request GET:/charts/transactions-count
     */
    getChartsTransactionsCount: (
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        'interval-type': IntervalType
      },
      params: RequestParams = {}
    ) =>
      this.request<TimedCount[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/charts/transactions-count`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description `interval-type` query param: hourly, daily
     *
     * @tags Charts
     * @name GetChartsTransactionsCountPerChain
     * @summary Get transaction count history per chain
     * @request GET:/charts/transactions-count-per-chain
     */
    getChartsTransactionsCountPerChain: (
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        'interval-type': IntervalType
      },
      params: RequestParams = {}
    ) =>
      this.request<
        PerChainTimedCount[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/charts/transactions-count-per-chain`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      })
  }
  contractEvents = {
    /**
     * @description Get contract events by transaction id
     *
     * @tags Contract events
     * @name GetContractEventsTransactionIdTransactionId
     * @request GET:/contract-events/transaction-id/{transaction_id}
     */
    getContractEventsTransactionIdTransactionId: (transactionId: string, params: RequestParams = {}) =>
      this.request<Event[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contract-events/transaction-id/${transactionId}`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description Get contract events by contract address
     *
     * @tags Contract events
     * @name GetContractEventsContractAddressContractAddress
     * @request GET:/contract-events/contract-address/{contract_address}
     */
    getContractEventsContractAddressContractAddress: (
      contractAddress: string,
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<Event[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contract-events/contract-address/${contractAddress}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description Get contract events by contract and input addresses
     *
     * @tags Contract events
     * @name GetContractEventsContractAddressContractAddressInputAddressInputAddress
     * @request GET:/contract-events/contract-address/{contract_address}/input-address/{input_address}
     */
    getContractEventsContractAddressContractAddressInputAddressInputAddress: (
      contractAddress: string,
      inputAddress: string,
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<Event[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contract-events/contract-address/${contractAddress}/input-address/${inputAddress}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      })
  }
  contracts = {
    /**
     * @description Get contract parent address if exist
     *
     * @tags Contracts
     * @name GetContractsContractParent
     * @request GET:/contracts/{contract}/parent
     */
    getContractsContractParent: (contract: string, params: RequestParams = {}) =>
      this.request<ContractParent, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${contract}/parent`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description Get sub contract addresses
     *
     * @tags Contracts
     * @name GetContractsContractSubContracts
     * @request GET:/contracts/{contract}/sub-contracts
     */
    getContractsContractSubContracts: (
      contract: string,
      query?: {
        /**
         * Page number
         * @format int32
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<SubContracts, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${contract}/sub-contracts`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      })
  }
  utils = {
    /**
     * @description Perform a sanity check
     *
     * @tags Utils
     * @name PutUtilsSanityCheck
     * @request PUT:/utils/sanity-check
     */
    putUtilsSanityCheck: (params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/sanity-check`,
        method: 'PUT',
        ...params
      }),

    /**
     * @description Update global log level, accepted: TRACE, DEBUG, INFO, WARN, ERROR
     *
     * @tags Utils
     * @name PutUtilsUpdateGlobalLoglevel
     * @request PUT:/utils/update-global-loglevel
     */
    putUtilsUpdateGlobalLoglevel: (data: 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/update-global-loglevel`,
        method: 'PUT',
        body: data,
        type: ContentType.Text,
        ...params
      }),

    /**
     * @description Update logback values
     *
     * @tags Utils
     * @name PutUtilsUpdateLogConfig
     * @request PUT:/utils/update-log-config
     */
    putUtilsUpdateLogConfig: (data?: LogbackValue[], params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/update-log-config`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params
      })
  }
}
