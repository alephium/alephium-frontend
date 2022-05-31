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

export interface AddressBalance {
  address: string

  /** @format uint256 */
  balance: string

  /** @format x.x ALPH */
  balanceHint: string

  /** @format uint256 */
  lockedBalance: string

  /** @format x.x ALPH */
  lockedBalanceHint: string
  warning?: string
}

export interface AddressInfo {
  address: string
  publicKey: string
  group: number
  path: string
}

export interface Addresses {
  activeAddress: string
  addresses: AddressInfo[]
}

export interface AssetInput {
  outputRef: OutputRef
  unlockScript: string
}

export interface AssetOutput {
  hint: number
  key: string

  /** @format uint256 */
  alphAmount: string
  address: string
  tokens: Token[]

  /** @format int64 */
  lockTime: number
  additionalData: string
  type: string
}

export interface AssetState {
  /** @format uint256 */
  alphAmount: string
  tokens: Token[]
}

export interface BadRequest {
  detail: string
}

export interface Balance {
  /** @format uint256 */
  balance: string

  /** @format x.x ALPH */
  balanceHint: string

  /** @format uint256 */
  lockedBalance: string

  /** @format x.x ALPH */
  lockedBalanceHint: string
  utxoNum: number
  warning?: string
}

export interface Balances {
  /** @format uint256 */
  totalBalance: string

  /** @format x.x ALPH */
  totalBalanceHint: string
  balances: AddressBalance[]
}

export interface Ban {
  peers: string[]
  type: string
}

export interface Banned {
  /** @format int64 */
  until: number
  type: string
}

export interface BlockEntry {
  hash: string

  /** @format int64 */
  timestamp: number
  chainFrom: number
  chainTo: number
  height: number
  deps: string[]
  transactions: Transaction[]
  nonce: string
  version: number
  depStateHash: string
  txsHash: string
  target: string
}

export interface BlockHeaderEntry {
  hash: string

  /** @format int64 */
  timestamp: number
  chainFrom: number
  chainTo: number
  height: number
  deps: string[]
}

export interface BrokerInfo {
  cliqueId: string
  brokerId: number
  brokerNum: number
  address: string
}

export interface BuildContractDeployScriptTx {
  fromPublicKey: string
  bytecode: string
  initialFields: Val[]

  /** @format uint256 */
  alphAmount?: string

  /** @format uint256 */
  issueTokenAmount?: string
  gas?: number

  /** @format uint256 */
  gasPrice?: string
  utxosLimit?: number
}

export interface BuildContractDeployScriptTxResult {
  group: number
  unsignedTx: string
  txId: string
  contractAddress: string
}

export interface BuildInfo {
  releaseVersion: string
  commit: string
}

export interface BuildMultisig {
  fromAddress: string
  fromPublicKeys: string[]
  destinations: Destination[]
  gas?: number

  /** @format uint256 */
  gasPrice?: string
  utxosLimit?: number
}

export interface BuildMultisigAddress {
  keys: string[]
  mrequired: number
}

export interface BuildMultisigAddressResult {
  address: string
}

export interface BuildScriptTx {
  fromPublicKey: string
  bytecode: string

  /** @format uint256 */
  alphAmount?: string
  tokens?: Token[]
  gas?: number

  /** @format uint256 */
  gasPrice?: string
  utxosLimit?: number
}

export interface BuildScriptTxResult {
  unsignedTx: string
  txId: string
  group: number
}

export interface BuildSweepAddressTransactions {
  fromPublicKey: string
  toAddress: string

  /** @format int64 */
  lockTime?: number
  gas?: number

  /** @format uint256 */
  gasPrice?: string
  utxosLimit?: number
}

export interface BuildSweepAddressTransactionsResult {
  unsignedTxs: SweepAddressTransaction[]
  fromGroup: number
  toGroup: number
}

export interface BuildTransaction {
  fromPublicKey: string
  destinations: Destination[]
  utxos?: OutputRef[]
  gas?: number

  /** @format uint256 */
  gasPrice?: string
  utxosLimit?: number
}

export interface BuildTransactionResult {
  unsignedTx: string
  gasAmount: number

  /** @format uint256 */
  gasPrice: string
  txId: string
  fromGroup: number
  toGroup: number
}

export interface ChainInfo {
  currentHeight: number
}

export interface ChainParams {
  networkId: number
  numZerosAtLeastInHash: number
  groupNumPerBroker: number
  groups: number
}

export interface ChangeActiveAddress {
  address: string
}

export interface CompileResult {
  bytecode: string
  codeHash: string
  fields: FieldsSig
  functions: FunctionSig[]
  events: EventSig[]
}

export interface Confirmed {
  blockHash: string
  txIndex: number
  chainConfirmations: number
  fromGroupConfirmations: number
  toGroupConfirmations: number
  type: string
}

export interface Contract {
  code: string
}

export interface ContractEvent {
  blockHash: string
  contractAddress: string
  txId: string
  eventIndex: number
  fields: Val[]
  type: string
}

export interface ContractOutput {
  hint: number
  key: string

  /** @format uint256 */
  alphAmount: string
  address: string
  tokens: Token[]
  type: string
}

export interface ContractState {
  address: string
  bytecode: string
  codeHash: string
  fields: Val[]
  asset: AssetState
}

export interface DecodeTransaction {
  unsignedTx: string
}

export interface Destination {
  address: string

  /** @format uint256 */
  alphAmount: string
  tokens?: Token[]

  /** @format int64 */
  lockTime?: number
}

export type DiscoveryAction = Reachable | Unreachable

export type Event = ContractEvent | TxScriptEvent

export interface EventSig {
  name: string
  signature: string
  fieldTypes: string[]
}

export interface Events {
  chainFrom: number
  chainTo: number
  events: Event[]
}

export interface FetchResponse {
  blocks: BlockEntry[][]
}

export interface FieldsSig {
  signature: string
  types: string[]
}

export interface FixedAssetOutput {
  hint: number
  key: string

  /** @format uint256 */
  alphAmount: string
  address: string
  tokens: Token[]

  /** @format int64 */
  lockTime: number
  additionalData: string
}

export interface FunctionSig {
  name: string
  signature: string
  argTypes: string[]
  returnTypes: string[]
}

export interface Group {
  group: number
}

export interface HashesAtHeight {
  headers: string[]
}

export interface InputAsset {
  address: string
  asset: AssetState
}

export interface InterCliquePeerInfo {
  cliqueId: string
  brokerId: number
  groupNumPerBroker: number
  address: string
  isSynced: boolean
  clientVersion: string
}

export interface InternalServerError {
  detail: string
}

export interface MemPooled {
  type: string
}

export interface MinerAddresses {
  addresses: string[]
}

export interface MinerAddressesInfo {
  addresses: AddressInfo[]
}

export type MisbehaviorAction = Ban | Unban

export interface NodeInfo {
  buildInfo: BuildInfo
  upnp: boolean
  externalAddress?: string
}

export interface NodeVersion {
  version: ReleaseVersion
}

export interface NotFound {
  detail: string
  resource: string
}

export type Output = AssetOutput | ContractOutput

export interface OutputRef {
  hint: number
  key: string
}

export interface PeerAddress {
  address: string
  restPort: number
  wsPort: number
  minerApiPort: number
}

export interface PeerMisbehavior {
  peer: string
  status: PeerStatus
}

export type PeerStatus = Banned | Penalty

export interface Penalty {
  value: number
  type: string
}

export interface Reachable {
  peers: string[]
  type: string
}

export interface ReleaseVersion {
  major: number
  minor: number
  patch: number
}

export interface RevealMnemonic {
  password: string
}

export interface RevealMnemonicResult {
  mnemonic: string
}

export interface Script {
  code: string
}

export interface SelfClique {
  cliqueId: string
  nodes: PeerAddress[]
  selfReady: boolean
  synced: boolean
}

export interface ServiceUnavailable {
  detail: string
}

export interface Sign {
  data: string
}

export interface SignResult {
  signature: string
}

export interface SubmitMultisig {
  unsignedTx: string
  signatures: string[]
}

export interface SubmitTransaction {
  unsignedTx: string
  signature: string
}

export interface Sweep {
  toAddress: string

  /** @format int64 */
  lockTime?: number
  gas?: number

  /** @format uint256 */
  gasPrice?: string
  utxosLimit?: number
}

export interface SweepAddressTransaction {
  txId: string
  unsignedTx: string
  gasAmount: number

  /** @format uint256 */
  gasPrice: string
}

export interface TestContract {
  group?: number
  address?: string
  bytecode: string
  initialFields: Val[]
  initialAsset?: AssetState
  testMethodIndex?: number
  testArgs: Val[]
  existingContracts?: ContractState[]
  inputAssets?: InputAsset[]
}

export interface TestContractResult {
  returns: Val[]
  gasUsed: number
  contracts: ContractState[]
  txOutputs: Output[]
  events: Event[]
}

export interface Token {
  id: string

  /** @format uint256 */
  amount: string
}

export interface Transaction {
  unsigned: UnsignedTx
  scriptExecutionOk: boolean
  contractInputs: OutputRef[]
  generatedOutputs: Output[]
  inputSignatures: string[]
  scriptSignatures: string[]
}

export interface TransactionTemplate {
  unsigned: UnsignedTx
  inputSignatures: string[]
  scriptSignatures: string[]
}

export interface Transfer {
  destinations: Destination[]
  gas?: number

  /** @format uint256 */
  gasPrice?: string
  utxosLimit?: number
}

export interface TransferResult {
  txId: string
  fromGroup: number
  toGroup: number
}

export interface TransferResults {
  results: TransferResult[]
}

export interface TxNotFound {
  type: string
}

export interface TxResult {
  txId: string
  fromGroup: number
  toGroup: number
}

export interface TxScriptEvent {
  blockHash: string
  txId: string
  eventIndex: number
  fields: Val[]
  type: string
}

export type TxStatus = Confirmed | MemPooled | TxNotFound

export interface UTXO {
  ref: OutputRef

  /** @format uint256 */
  amount: string
  tokens: Token[]

  /** @format int64 */
  lockTime: number
  additionalData: string
}

export interface UTXOs {
  utxos: UTXO[]
  warning?: string
}

export interface Unauthorized {
  detail: string
}

export interface Unban {
  peers: string[]
  type: string
}

export interface UnconfirmedTransactions {
  fromGroup: number
  toGroup: number
  unconfirmedTransactions: TransactionTemplate[]
}

export interface Unreachable {
  peers: string[]
  type: string
}

export interface UnsignedTx {
  txId: string
  version: number
  networkId: number
  scriptOpt?: string
  gasAmount: number

  /** @format uint256 */
  gasPrice: string
  inputs: AssetInput[]
  fixedOutputs: FixedAssetOutput[]
}

export type Val = ValAddress | ValArray | ValBool | ValByteVec | ValI256 | ValU256

export interface ValAddress {
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
  value: string
  type: string
}

export interface ValI256 {
  value: string
  type: string
}

export interface ValU256 {
  /** @format uint256 */
  value: string
  type: string
}

export interface VerifySignature {
  data: string
  signature: string
  publicKey: string
}

export interface WalletCreation {
  password: string
  walletName: string
  isMiner?: boolean
  mnemonicPassphrase?: string
  mnemonicSize?: number
}

export interface WalletCreationResult {
  walletName: string
  mnemonic: string
}

export interface WalletDeletion {
  password: string
}

export interface WalletRestore {
  password: string
  mnemonic: string
  walletName: string
  isMiner?: boolean
  mnemonicPassphrase?: string
}

export interface WalletRestoreResult {
  walletName: string
}

export interface WalletStatus {
  walletName: string
  locked: boolean
}

export interface WalletUnlock {
  password: string
  mnemonicPassphrase?: string
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
  UrlEncoded = 'application/x-www-form-urlencoded'
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '{protocol}://{host}:{port}'
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

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
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

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
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

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
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
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
        ...(requestParams.headers || {})
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
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
 * @title Alephium API
 * @version 1.3.0
 * @baseUrl {protocol}://{host}:{port}
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  wallets = {
    /**
     * No description
     *
     * @tags Wallets
     * @name GetWallets
     * @summary List available wallets
     * @request GET:/wallets
     */
    getWallets: (params: RequestParams = {}) =>
      this.request<WalletStatus[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PutWallets
     * @summary Restore a wallet from your mnemonic
     * @request PUT:/wallets
     */
    putWallets: (data: WalletRestore, params: RequestParams = {}) =>
      this.request<
        WalletRestoreResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/wallets`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * @description A new wallet will be created and respond with a mnemonic. Make sure to keep that mnemonic safely as it will allows you to recover your wallet. Default mnemonic size is 24, (options: 12, 15, 18, 21, 24).
     *
     * @tags Wallets
     * @name PostWallets
     * @summary Create a new wallet
     * @request POST:/wallets
     */
    postWallets: (data: WalletCreation, params: RequestParams = {}) =>
      this.request<
        WalletCreationResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/wallets`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name GetWalletsWalletName
     * @summary Get wallet's status
     * @request GET:/wallets/{wallet_name}
     */
    getWalletsWalletName: (walletName: string, params: RequestParams = {}) =>
      this.request<WalletStatus, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name DeleteWalletsWalletName
     * @summary Delete your wallet file (can be recovered with your mnemonic)
     * @request DELETE:/wallets/{wallet_name}
     */
    deleteWalletsWalletName: (walletName: string, data: WalletDeletion, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}`,
        method: 'DELETE',
        body: data,
        type: ContentType.Json,
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameLock
     * @summary Lock your wallet
     * @request POST:/wallets/{wallet_name}/lock
     */
    postWalletsWalletNameLock: (walletName: string, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/lock`,
        method: 'POST',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameUnlock
     * @summary Unlock your wallet
     * @request POST:/wallets/{wallet_name}/unlock
     */
    postWalletsWalletNameUnlock: (walletName: string, data: WalletUnlock, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/unlock`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name GetWalletsWalletNameBalances
     * @summary Get your total balance
     * @request GET:/wallets/{wallet_name}/balances
     */
    getWalletsWalletNameBalances: (walletName: string, query?: { utxosLimit?: number }, params: RequestParams = {}) =>
      this.request<Balances, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/balances`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameRevealMnemonic
     * @summary Reveal your mnemonic. !!! use it with caution !!!
     * @request POST:/wallets/{wallet_name}/reveal-mnemonic
     */
    postWalletsWalletNameRevealMnemonic: (walletName: string, data: RevealMnemonic, params: RequestParams = {}) =>
      this.request<
        RevealMnemonicResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/wallets/${walletName}/reveal-mnemonic`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameTransfer
     * @summary Transfer ALPH from the active address
     * @request POST:/wallets/{wallet_name}/transfer
     */
    postWalletsWalletNameTransfer: (walletName: string, data: Transfer, params: RequestParams = {}) =>
      this.request<TransferResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/transfer`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameSweepActiveAddress
     * @summary Transfer all unlocked ALPH from the active address to another address
     * @request POST:/wallets/{wallet_name}/sweep-active-address
     */
    postWalletsWalletNameSweepActiveAddress: (walletName: string, data: Sweep, params: RequestParams = {}) =>
      this.request<TransferResults, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/sweep-active-address`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameSweepAllAddresses
     * @summary Transfer unlocked ALPH from all addresses (including all mining addresses if applicable) to another address
     * @request POST:/wallets/{wallet_name}/sweep-all-addresses
     */
    postWalletsWalletNameSweepAllAddresses: (walletName: string, data: Sweep, params: RequestParams = {}) =>
      this.request<TransferResults, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/sweep-all-addresses`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameSign
     * @summary Sign the given data and return back the signature
     * @request POST:/wallets/{wallet_name}/sign
     */
    postWalletsWalletNameSign: (walletName: string, data: Sign, params: RequestParams = {}) =>
      this.request<SignResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/sign`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name GetWalletsWalletNameAddresses
     * @summary List all your wallet's addresses
     * @request GET:/wallets/{wallet_name}/addresses
     */
    getWalletsWalletNameAddresses: (walletName: string, params: RequestParams = {}) =>
      this.request<Addresses, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/addresses`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name GetWalletsWalletNameAddressesAddress
     * @summary Get address' info
     * @request GET:/wallets/{wallet_name}/addresses/{address}
     */
    getWalletsWalletNameAddressesAddress: (walletName: string, address: string, params: RequestParams = {}) =>
      this.request<AddressInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/addresses/${address}`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description This endpoint can only be called if the wallet was created with the `isMiner = true` flag
     *
     * @tags Miners
     * @name GetWalletsWalletNameMinerAddresses
     * @summary List all miner addresses per group
     * @request GET:/wallets/{wallet_name}/miner-addresses
     */
    getWalletsWalletNameMinerAddresses: (walletName: string, params: RequestParams = {}) =>
      this.request<
        MinerAddressesInfo[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/wallets/${walletName}/miner-addresses`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * @description Cannot be called from a miner wallet
     *
     * @tags Wallets
     * @name PostWalletsWalletNameDeriveNextAddress
     * @summary Derive your next address
     * @request POST:/wallets/{wallet_name}/derive-next-address
     */
    postWalletsWalletNameDeriveNextAddress: (
      walletName: string,
      query?: { group?: number },
      params: RequestParams = {}
    ) =>
      this.request<AddressInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/derive-next-address`,
        method: 'POST',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * @description Your wallet need to have been created with the miner flag set to true
     *
     * @tags Miners
     * @name PostWalletsWalletNameDeriveNextMinerAddresses
     * @summary Derive your next miner addresses for each group
     * @request POST:/wallets/{wallet_name}/derive-next-miner-addresses
     */
    postWalletsWalletNameDeriveNextMinerAddresses: (walletName: string, params: RequestParams = {}) =>
      this.request<AddressInfo[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/derive-next-miner-addresses`,
        method: 'POST',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameChangeActiveAddress
     * @summary Choose the active address
     * @request POST:/wallets/{wallet_name}/change-active-address
     */
    postWalletsWalletNameChangeActiveAddress: (
      walletName: string,
      data: ChangeActiveAddress,
      params: RequestParams = {}
    ) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/change-active-address`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params
      })
  }
  infos = {
    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosNode
     * @summary Get info about that node
     * @request GET:/infos/node
     */
    getInfosNode: (params: RequestParams = {}) =>
      this.request<NodeInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/node`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosVersion
     * @summary Get version about that node
     * @request GET:/infos/version
     */
    getInfosVersion: (params: RequestParams = {}) =>
      this.request<NodeVersion, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/version`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosChainParams
     * @summary Get key params about your blockchain
     * @request GET:/infos/chain-params
     */
    getInfosChainParams: (params: RequestParams = {}) =>
      this.request<ChainParams, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/chain-params`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosSelfClique
     * @summary Get info about your own clique
     * @request GET:/infos/self-clique
     */
    getInfosSelfClique: (params: RequestParams = {}) =>
      this.request<SelfClique, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/self-clique`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosInterCliquePeerInfo
     * @summary Get infos about the inter cliques
     * @request GET:/infos/inter-clique-peer-info
     */
    getInfosInterCliquePeerInfo: (params: RequestParams = {}) =>
      this.request<
        InterCliquePeerInfo[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/infos/inter-clique-peer-info`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosDiscoveredNeighbors
     * @summary Get discovered neighbors
     * @request GET:/infos/discovered-neighbors
     */
    getInfosDiscoveredNeighbors: (params: RequestParams = {}) =>
      this.request<BrokerInfo[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/discovered-neighbors`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosMisbehaviors
     * @summary Get the misbehaviors of peers
     * @request GET:/infos/misbehaviors
     */
    getInfosMisbehaviors: (params: RequestParams = {}) =>
      this.request<PeerMisbehavior[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/misbehaviors`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name PostInfosMisbehaviors
     * @summary Ban/Unban given peers
     * @request POST:/infos/misbehaviors
     */
    postInfosMisbehaviors: (data: MisbehaviorAction, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/misbehaviors`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosUnreachable
     * @summary Get the unreachable brokers
     * @request GET:/infos/unreachable
     */
    getInfosUnreachable: (params: RequestParams = {}) =>
      this.request<string[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/unreachable`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name PostInfosDiscovery
     * @summary Set brokers to be unreachable/reachable
     * @request POST:/infos/discovery
     */
    postInfosDiscovery: (data: DiscoveryAction, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/discovery`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosHistoryHashrate
     * @summary Get history average hashrate on the given time interval
     * @request GET:/infos/history-hashrate
     */
    getInfosHistoryHashrate: (query: { fromTs: number; toTs?: number }, params: RequestParams = {}) =>
      this.request<string, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/history-hashrate`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosCurrentHashrate
     * @summary Get average hashrate from `now - timespan(millis)` to `now`
     * @request GET:/infos/current-hashrate
     */
    getInfosCurrentHashrate: (query?: { timespan?: number }, params: RequestParams = {}) =>
      this.request<string, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/current-hashrate`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      })
  }
  blockflow = {
    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflow
     * @summary List blocks on the given time interval
     * @request GET:/blockflow
     */
    getBlockflow: (query: { fromTs: number; toTs?: number }, params: RequestParams = {}) =>
      this.request<FetchResponse, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowBlocksBlockHash
     * @summary Get a block with hash
     * @request GET:/blockflow/blocks/{block_hash}
     */
    getBlockflowBlocksBlockHash: (blockHash: string, params: RequestParams = {}) =>
      this.request<BlockEntry, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/blocks/${blockHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowIsBlockInMainChain
     * @summary Check if the block is in main chain
     * @request GET:/blockflow/is-block-in-main-chain
     */
    getBlockflowIsBlockInMainChain: (query: { blockHash: string }, params: RequestParams = {}) =>
      this.request<boolean, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/is-block-in-main-chain`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowHashes
     * @summary Get all block's hashes at given height for given groups
     * @request GET:/blockflow/hashes
     */
    getBlockflowHashes: (query: { fromGroup: number; toGroup: number; height: number }, params: RequestParams = {}) =>
      this.request<HashesAtHeight, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/hashes`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowChainInfo
     * @summary Get infos about the chain from the given groups
     * @request GET:/blockflow/chain-info
     */
    getBlockflowChainInfo: (query: { fromGroup: number; toGroup: number }, params: RequestParams = {}) =>
      this.request<ChainInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/chain-info`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowHeadersBlockHash
     * @summary Get block header
     * @request GET:/blockflow/headers/{block_hash}
     */
    getBlockflowHeadersBlockHash: (blockHash: string, params: RequestParams = {}) =>
      this.request<BlockHeaderEntry, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/headers/${blockHash}`,
        method: 'GET',
        format: 'json',
        ...params
      })
  }
  addresses = {
    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressBalance
     * @summary Get the balance of an address
     * @request GET:/addresses/{address}/balance
     */
    getAddressesAddressBalance: (address: string, query?: { utxosLimit?: number }, params: RequestParams = {}) =>
      this.request<Balance, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/balance`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressUtxos
     * @summary Get the UTXOs of an address
     * @request GET:/addresses/{address}/utxos
     */
    getAddressesAddressUtxos: (address: string, query?: { utxosLimit?: number }, params: RequestParams = {}) =>
      this.request<UTXOs, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/utxos`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressGroup
     * @summary Get the group of an address
     * @request GET:/addresses/{address}/group
     */
    getAddressesAddressGroup: (address: string, params: RequestParams = {}) =>
      this.request<Group, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/group`,
        method: 'GET',
        format: 'json',
        ...params
      })
  }
  transactions = {
    /**
     * No description
     *
     * @tags Transactions
     * @name GetTransactionsUnconfirmed
     * @summary List unconfirmed transactions
     * @request GET:/transactions/unconfirmed
     */
    getTransactionsUnconfirmed: (params: RequestParams = {}) =>
      this.request<
        UnconfirmedTransactions[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/unconfirmed`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsBuild
     * @summary Build an unsigned transaction to a number of recipients
     * @request POST:/transactions/build
     */
    postTransactionsBuild: (data: BuildTransaction, params: RequestParams = {}) =>
      this.request<
        BuildTransactionResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/build`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsSweepAddressBuild
     * @summary Build unsigned transactions to send all unlocked balanced of one address to another address
     * @request POST:/transactions/sweep-address/build
     */
    postTransactionsSweepAddressBuild: (data: BuildSweepAddressTransactions, params: RequestParams = {}) =>
      this.request<
        BuildSweepAddressTransactionsResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/sweep-address/build`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsSubmit
     * @summary Submit a signed transaction
     * @request POST:/transactions/submit
     */
    postTransactionsSubmit: (data: SubmitTransaction, params: RequestParams = {}) =>
      this.request<TxResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/submit`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsDecodeUnsignedTx
     * @summary Decode an unsigned transaction
     * @request POST:/transactions/decode-unsigned-tx
     */
    postTransactionsDecodeUnsignedTx: (data: DecodeTransaction, params: RequestParams = {}) =>
      this.request<UnsignedTx, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/decode-unsigned-tx`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Transactions
     * @name GetTransactionsStatus
     * @summary Get tx status
     * @request GET:/transactions/status
     */
    getTransactionsStatus: (
      query: { txId: string; fromGroup?: number; toGroup?: number },
      params: RequestParams = {}
    ) =>
      this.request<TxStatus, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/status`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      })
  }
  contracts = {
    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsCompileScript
     * @summary Compile a script
     * @request POST:/contracts/compile-script
     */
    postContractsCompileScript: (data: Script, params: RequestParams = {}) =>
      this.request<CompileResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/compile-script`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsUnsignedTxBuildScript
     * @summary Build an unsigned script
     * @request POST:/contracts/unsigned-tx/build-script
     */
    postContractsUnsignedTxBuildScript: (data: BuildScriptTx, params: RequestParams = {}) =>
      this.request<
        BuildScriptTxResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/contracts/unsigned-tx/build-script`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsCompileContract
     * @summary Compile a smart contract
     * @request POST:/contracts/compile-contract
     */
    postContractsCompileContract: (data: Contract, params: RequestParams = {}) =>
      this.request<CompileResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/compile-contract`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsUnsignedTxBuildContract
     * @summary Build an unsigned contract
     * @request POST:/contracts/unsigned-tx/build-contract
     */
    postContractsUnsignedTxBuildContract: (data: BuildContractDeployScriptTx, params: RequestParams = {}) =>
      this.request<
        BuildContractDeployScriptTxResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/contracts/unsigned-tx/build-contract`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Contracts
     * @name GetContractsAddressState
     * @summary Get contract state
     * @request GET:/contracts/{address}/state
     */
    getContractsAddressState: (address: string, query: { group: number }, params: RequestParams = {}) =>
      this.request<ContractState, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${address}/state`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsTestContract
     * @summary Test contract
     * @request POST:/contracts/test-contract
     */
    postContractsTestContract: (data: TestContract, params: RequestParams = {}) =>
      this.request<TestContractResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>(
        {
          path: `/contracts/test-contract`,
          method: 'POST',
          body: data,
          type: ContentType.Json,
          format: 'json',
          ...params
        }
      )
  }
  multisig = {
    /**
     * No description
     *
     * @tags Multi-signature
     * @name PostMultisigAddress
     * @summary Create the multisig address and unlock script
     * @request POST:/multisig/address
     */
    postMultisigAddress: (data: BuildMultisigAddress, params: RequestParams = {}) =>
      this.request<
        BuildMultisigAddressResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/multisig/address`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Multi-signature
     * @name PostMultisigBuild
     * @summary Build a multisig unsigned transaction
     * @request POST:/multisig/build
     */
    postMultisigBuild: (data: BuildMultisig, params: RequestParams = {}) =>
      this.request<
        BuildTransactionResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/multisig/build`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Multi-signature
     * @name PostMultisigSubmit
     * @summary Submit a multi-signed transaction
     * @request POST:/multisig/submit
     */
    postMultisigSubmit: (data: SubmitMultisig, params: RequestParams = {}) =>
      this.request<TxResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/multisig/submit`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      })
  }
  utils = {
    /**
     * No description
     *
     * @tags Utils
     * @name PostUtilsVerifySignature
     * @summary Verify the SecP256K1 signature of some data
     * @request POST:/utils/verify-signature
     */
    postUtilsVerifySignature: (data: VerifySignature, params: RequestParams = {}) =>
      this.request<boolean, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/verify-signature`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Utils
     * @name PutUtilsCheckHashIndexing
     * @summary Check and repair the indexing of block hashes
     * @request PUT:/utils/check-hash-indexing
     */
    putUtilsCheckHashIndexing: (params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/check-hash-indexing`,
        method: 'PUT',
        ...params
      })
  }
  miners = {
    /**
     * No description
     *
     * @tags Miners
     * @name PostMinersCpuMining
     * @summary Execute an action on CPU miner. !!! for test only !!!
     * @request POST:/miners/cpu-mining
     */
    postMinersCpuMining: (query: { action: string }, params: RequestParams = {}) =>
      this.request<boolean, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners/cpu-mining`,
        method: 'POST',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Miners
     * @name GetMinersAddresses
     * @summary List miner's addresses
     * @request GET:/miners/addresses
     */
    getMinersAddresses: (params: RequestParams = {}) =>
      this.request<MinerAddresses, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners/addresses`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Miners
     * @name PutMinersAddresses
     * @summary Update miner's addresses, but better to use user.conf instead
     * @request PUT:/miners/addresses
     */
    putMinersAddresses: (data: MinerAddresses, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners/addresses`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params
      })
  }
  events = {
    /**
     * No description
     *
     * @tags Events
     * @name GetEventsContractInBlock
     * @summary Get events for a contract within a block
     * @request GET:/events/contract/in-block
     */
    getEventsContractInBlock: (query: { block: string; contractAddress: string }, params: RequestParams = {}) =>
      this.request<Events, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/events/contract/in-block`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Events
     * @name GetEventsContractWithinBlocks
     * @summary Get events for a contract within a range of blocks
     * @request GET:/events/contract/within-blocks
     */
    getEventsContractWithinBlocks: (
      query: { fromBlock: string; toBlock?: string; contractAddress: string },
      params: RequestParams = {}
    ) =>
      this.request<Events[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/events/contract/within-blocks`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Events
     * @name GetEventsContractWithinTimeInterval
     * @summary Get events for a contract within a time interval
     * @request GET:/events/contract/within-time-interval
     */
    getEventsContractWithinTimeInterval: (
      query: { fromTs: number; toTs?: number; contractAddress: string },
      params: RequestParams = {}
    ) =>
      this.request<Events[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/events/contract/within-time-interval`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Events
     * @name GetEventsTxScript
     * @summary Get events for a TxScript
     * @request GET:/events/tx-script
     */
    getEventsTxScript: (query: { block: string; txId: string }, params: RequestParams = {}) =>
      this.request<Events, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/events/tx-script`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      })
  }
}
