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
  address: string;

  /** @format uint256 */
  balance: string;
}

export interface AddressInfo {
  address: string;
  publicKey: string;
}

export interface Addresses {
  activeAddress: string;
  addresses: string[];
}

export interface Asset {
  outputRef: OutputRef;
  unlockScript: string;
}

export interface Asset1 {
  /** @format uint256 */
  amount: string;
  address: string;
  tokens: Token[];

  /** @format int64 */
  lockTime: number;
  additionalData: string;
}

export interface BadRequest {
  detail: string;
}

export interface Balance {
  /** @format uint256 */
  balance: string;

  /** @format uint256 */
  lockedBalance: string;
  utxoNum: number;
}

export interface Balances {
  /** @format uint256 */
  totalBalance: string;
  balances: AddressBalance[];
}

export interface Banned {
  /** @format int64 */
  until: number;
}

export interface BlockEntry {
  hash: string;

  /** @format int64 */
  timestamp: number;
  chainFrom: number;
  chainTo: number;
  height: number;
  deps: string[];
  transactions: Tx[];
}

export interface BlockHeaderEntry {
  hash: string;

  /** @format int64 */
  timestamp: number;
  chainFrom: number;
  chainTo: number;
  height: number;
  deps: string[];
}

export interface BrokerInfo {
  cliqueId: string;
  brokerId: number;
  brokerNum: number;
  address: string;
}

export interface BuildContract {
  fromPublicKey: string;
  code: string;
}

export interface BuildContractResult {
  unsignedTx: string;
  hash: string;
  fromGroup: number;
  toGroup: number;
}

export interface BuildMultisig {
  fromAddress: string;
  fromPublicKeys: string[];
  destinations: Destination[];
  gas?: number;
  gasPrice?: GasPrice;
}

export interface BuildMultisigAddress {
  keys: string[];
  mrequired: number;
}

export interface BuildSweepAllTransaction {
  fromPublicKey: string;
  toAddress: string;

  /** @format int64 */
  lockTime?: number;
  gas?: number;
  gasPrice?: GasPrice;
}

export interface BuildTransaction {
  fromPublicKey: string;
  destinations: Destination[];
  utxos?: OutputRef[];
  gas?: number;
  gasPrice?: GasPrice;
}

export interface BuildTransactionResult {
  unsignedTx: string;
  txId: string;
  fromGroup: number;
  toGroup: number;
}

export interface ChainInfo {
  currentHeight: number;
}

export interface ChangeActiveAddress {
  address: string;
}

export interface Compile {
  address: string;
  type: string;
  code: string;
  state?: string;
}

export interface CompileResult {
  code: string;
}

export interface Confirmed {
  blockHash: string;
  txIndex: number;
  chainConfirmations: number;
  fromGroupConfirmations: number;
  toGroupConfirmations: number;
}

export interface Contract {
  outputRef: OutputRef;
}

export interface Contract1 {
  /** @format uint256 */
  amount: string;
  address: string;
  tokens: Token[];
}

export interface DecodeTransaction {
  unsignedTx: string;
}

export interface Destination {
  address: string;

  /** @format uint256 */
  amount: string;
  tokens?: Token[];

  /** @format int64 */
  lockTime?: number;
}

export interface FetchResponse {
  blocks: BlockEntry[][];
}

export interface GasPrice {
  /** @format uint256 */
  value: string;
}

export interface Group {
  group: number;
}

export interface HashesAtHeight {
  headers: string[];
}

export type Input = Asset | Contract;

export interface InterCliquePeerInfo {
  cliqueId: string;
  brokerId: number;
  groupNumPerBroker: number;
  address: string;
  isSynced: boolean;
}

export interface InternalServerError {
  detail: string;
}

export type MemPooled = object;

export interface MinerAddressInfo {
  address: string;
  group: number;
}

export interface MinerAddresses {
  addresses: string[];
}

export interface MinerAddressesInfo {
  addresses: MinerAddressInfo[];
}

export type MisbehaviorAction = Unban;

export interface NodeInfo {
  isMining: boolean;
}

export interface NotFound {
  detail: string;
  resource: string;
}

export type NotFound1 = object;

export type Output = Asset1 | Contract1;

export interface OutputRef {
  hint: number;
  key: string;
}

export interface PeerAddress {
  address: string;
  restPort: number;
  wsPort: number;
  minerApiPort: number;
}

export interface PeerMisbehavior {
  peer: string;
  status: PeerStatus;
}

export type PeerStatus = Banned | Penalty;

export interface Penalty {
  value: number;
}

export interface Result {
  walletName: string;
  mnemonic: string;
}

export interface Result1 {
  walletName: string;
}

export interface Result2 {
  mnemonic: string;
}

export interface Result3 {
  txId: string;
  fromGroup: number;
  toGroup: number;
}

export interface Result4 {
  signature: string;
}

export interface Result5 {
  address: string;
}

export interface Result6 {
  address: string;
}

export interface RevealMnemonic {
  password: string;
}

export interface SelfClique {
  cliqueId: string;
  networkId: number;
  numZerosAtLeastInHash: number;
  nodes: PeerAddress[];
  selfReady: boolean;
  synced: boolean;
  groupNumPerBroker: number;
  groups: number;
}

export interface ServiceUnavailable {
  detail: string;
}

export interface Sign {
  data: string;
}

export interface SubmitContract {
  code: string;
  tx: string;
  signature: string;
  fromGroup: number;
}

export interface SubmitMultisig {
  unsignedTx: string;
  signatures: string[];
}

export interface SubmitTransaction {
  unsignedTx: string;
  signature: string;
}

export interface SweepAll {
  toAddress: string;

  /** @format int64 */
  lockTime?: number;
  gas?: number;
  gasPrice?: GasPrice;
}

export interface Token {
  id: string;

  /** @format uint256 */
  amount: string;
}

export interface Transfer {
  destinations: Destination[];
  gas?: number;
  gasPrice?: GasPrice;
}

export interface Tx {
  id: string;
  inputs: Input[];
  outputs: Output[];
  gasAmount: number;

  /** @format uint256 */
  gasPrice: string;
}

export interface TxResult {
  txId: string;
  fromGroup: number;
  toGroup: number;
}

export type TxStatus = Confirmed | MemPooled | NotFound1;

export interface UTXO {
  ref: OutputRef;

  /** @format uint256 */
  amount: string;
  tokens: Token[];

  /** @format int64 */
  lockTime: number;
  additionalData: string;
}

export interface Unauthorized {
  detail: string;
}

export interface Unban {
  peers: string[];
}

export interface UnconfirmedTransactions {
  fromGroup: number;
  toGroup: number;
  unconfirmedTransactions: Tx[];
}

export interface WalletCreation {
  password: string;
  walletName?: string;
  isMiner?: boolean;
  mnemonicPassphrase?: string;
  mnemonicSize?: number;
}

export interface WalletDeletion {
  password: string;
}

export interface WalletRestore {
  password: string;
  mnemonic: string;
  isMiner?: boolean;
  walletName?: string;
  mnemonicPassphrase?: string;
}

export interface WalletStatus {
  walletName: string;
  locked: boolean;
}

export interface WalletUnlock {
  password: string;
  mnemonicPassphrase?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "{protocol}://{host}:{port}";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private addQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return `${value.map(this.addQueryParam).join("&")}`;
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((data, key) => {
        data.append(key, input[key]);
        return data;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

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
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Alephium API
 * @version 1.0
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
        method: "GET",
        format: "json",
        ...params,
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
      this.request<Result1, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
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
      this.request<Result, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
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
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
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
        method: "POST",
        ...params,
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
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name GetWalletsWalletNameBalances
     * @summary Get your total balance
     * @request GET:/wallets/{wallet_name}/balances
     */
    getWalletsWalletNameBalances: (walletName: string, params: RequestParams = {}) =>
      this.request<Balances, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/balances`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name GetWalletsWalletNameRevealMnemonic
     * @summary Reveal your mnemonic. !!! use it with caution !!!
     * @request GET:/wallets/{wallet_name}/reveal-mnemonic
     */
    getWalletsWalletNameRevealMnemonic: (walletName: string, data: RevealMnemonic, params: RequestParams = {}) =>
      this.request<Result2, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/reveal-mnemonic`,
        method: "GET",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameTransfer
     * @summary Transfer ALF
     * @request POST:/wallets/{wallet_name}/transfer
     */
    postWalletsWalletNameTransfer: (walletName: string, data: Transfer, params: RequestParams = {}) =>
      this.request<Result3, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/transfer`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameSweepAll
     * @summary Transfer all ALF to an address
     * @request POST:/wallets/{wallet_name}/sweep-all
     */
    postWalletsWalletNameSweepAll: (walletName: string, data: SweepAll, params: RequestParams = {}) =>
      this.request<Result3, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/sweep-all`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
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
      this.request<Result4, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/sign`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Cannot be called from a miner wallet
     *
     * @tags Wallets
     * @name PostWalletsWalletNameDeriveNextAddress
     * @summary Derive your next address
     * @request POST:/wallets/{wallet_name}/derive-next-address
     */
    postWalletsWalletNameDeriveNextAddress: (walletName: string, params: RequestParams = {}) =>
      this.request<Result5, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/derive-next-address`,
        method: "POST",
        format: "json",
        ...params,
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
      this.request<MinerAddressInfo[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>(
        {
          path: `/wallets/${walletName}/derive-next-miner-addresses`,
          method: "POST",
          format: "json",
          ...params,
        },
      ),

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
      params: RequestParams = {},
    ) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/change-active-address`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
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
        method: "GET",
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Infos
     * @name PostInfosMisbehaviors
     * @summary Unban given peers
     * @request POST:/infos/misbehaviors
     */
    postInfosMisbehaviors: (data: MisbehaviorAction, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/misbehaviors`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  blockflow = {
    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflow
     * @summary List blocks on the given time interval
     * @request GET:/blockflow
     */
    getBlockflow: (query: { fromTs: number; toTs: number }, params: RequestParams = {}) =>
      this.request<FetchResponse, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
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
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowChains
     * @summary Get infos about the chain from the given groups
     * @request GET:/blockflow/chains
     */
    getBlockflowChains: (query: { fromGroup: number; toGroup: number }, params: RequestParams = {}) =>
      this.request<ChainInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/chains`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  addresses = {
    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressBalance
     * @summary Get the balance of an address
     * @request GET:/addresses/{address}/balance
     */
    getAddressesAddressBalance: (address: string, params: RequestParams = {}) =>
      this.request<Balance, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/balance`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressUtxos
     * @summary Get the UTXOs of an address
     * @request GET:/addresses/{address}/utxos
     */
    getAddressesAddressUtxos: (address: string, params: RequestParams = {}) =>
      this.request<UTXO[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/utxos`,
        method: "GET",
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
      }),
  };
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
        method: "GET",
        format: "json",
        ...params,
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
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsSweepAllBuild
     * @summary Build an unsigned transaction to send all unlocked balanced to an address
     * @request POST:/transactions/sweep-all/build
     */
    postTransactionsSweepAllBuild: (data: BuildSweepAllTransaction, params: RequestParams = {}) =>
      this.request<
        BuildTransactionResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/sweep-all/build`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
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
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsDecode
     * @summary Decode an unsigned transaction
     * @request POST:/transactions/decode
     */
    postTransactionsDecode: (data: DecodeTransaction, params: RequestParams = {}) =>
      this.request<Tx, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/decode`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
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
      params: RequestParams = {},
    ) =>
      this.request<TxStatus, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/status`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  contracts = {
    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsSubmit
     * @summary Submit a signed smart contract
     * @request POST:/contracts/submit
     */
    postContractsSubmit: (data: SubmitContract, params: RequestParams = {}) =>
      this.request<TxResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/submit`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsCompile
     * @summary Compile a smart contract
     * @request POST:/contracts/compile
     */
    postContractsCompile: (data: Compile, params: RequestParams = {}) =>
      this.request<CompileResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/compile`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsBuild
     * @summary Build an unsigned contract
     * @request POST:/contracts/build
     */
    postContractsBuild: (data: BuildContract, params: RequestParams = {}) =>
      this.request<
        BuildContractResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/contracts/build`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
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
      this.request<Result6, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/multisig/address`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
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
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
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
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  miners = {
    /**
     * No description
     *
     * @tags Miners
     * @name PostMiners
     * @summary Execute an action on miners
     * @request POST:/miners
     */
    postMiners: (query: { action: string }, params: RequestParams = {}) =>
      this.request<boolean, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners`,
        method: "POST",
        query: query,
        format: "json",
        ...params,
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
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Miners
     * @name PutMinersAddresses
     * @summary Update miner's addresses
     * @request PUT:/miners/addresses
     */
    putMinersAddresses: (data: MinerAddresses, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners/addresses`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
}
