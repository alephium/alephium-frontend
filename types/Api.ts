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

export interface WalletCreation {
  password: string;
  walletName?: string;
  isMiner?: boolean;
  mnemonicPassphrase?: string;
  mnemonicSize?: number;
}

export interface BadRequest {
  detail: string;
}

export interface NotFound {
  detail: string;
  resource: number;
}

export interface Unauthorized {
  detail: string;
}

export interface Result {
  walletName: string;
  mnemonic: string;
}

export interface WalletRestore {
  password: string;
  mnemonic: string;
  isMiner?: boolean;
  walletName?: string;
  mnemonicPassphrase?: string;
}

export interface Result1 {
  walletName: string;
}

export interface WalletStatus {
  walletName: string;
  locked: boolean;
}

export interface WalletUnlock {
  password: string;
}

export interface WalletDeletion {
  password: string;
}

export interface Balances {
  /** @format uint256 */
  totalBalance: number;
  balances?: AddressBalance[];
}

export interface AddressBalance {
  address: string;

  /** @format uint256 */
  balance: number;
}

export interface Transfer {
  address: string;

  /** @format uint256 */
  amount: number;
}

export interface Result2 {
  txId: string;
  fromGroup: number;
  toGroup: number;
}

export interface Addresses {
  activeAddress: string;
  addresses?: string[];
}

export interface MinerAddressesInfo {
  addresses?: AddressInfo[];
}

export interface AddressInfo {
  address: string;
  group: number;
}

export interface ChangeActiveAddress {
  address: string;
}

export interface InternalServerError {
  detail: string;
}

export interface ServiceUnavailable {
  detail: string;
}

export interface SelfClique {
  cliqueId: string;
  networkType: NetworkType;
  numZerosAtLeastInHash: number;
  nodes?: PeerAddress[];
  synced: boolean;
  groupNumPerBroker: number;
  groups: number;
}

export type NetworkType = Devnet | Mainnet | Testnet;

export type Devnet = object;

export type Mainnet = object;

export type Testnet = object;

export interface PeerAddress {
  address: string;
  restPort: number;
  wsPort: number;
}

export interface InterCliquePeerInfo {
  cliqueId: string;
  brokerId: number;
  groupNumPerBroker: number;
  address: string;
  isSynced: boolean;
}

export interface BrokerInfo {
  cliqueId: string;
  brokerId: number;
  groupNumPerBroker: number;
  address: string;
}

export interface PeerMisbehavior {
  peer: string;
  status: PeerStatus;
}

export type PeerStatus = Banned | Penalty;

export interface Banned {
  until: number;
}

export interface Penalty {
  value: number;
}

export interface FetchResponse {
  blocks?: BlockEntry[];
}

export interface BlockEntry {
  hash: string;
  timestamp: number;
  chainFrom: number;
  chainTo: number;
  height: number;
  deps?: string[];
  transactions?: Tx[];
}

export interface Tx {
  id: string;
  inputs?: Input[];
  outputs?: Output[];
}

export interface Input {
  outputRef: OutputRef;
  unlockScript?: string;
}

export interface OutputRef {
  scriptHint: number;
  key: string;
}

export interface Output {
  /** @format uint256 */
  amount: number;
  address: string;
  lockTime?: number;
}

export interface Balance {
  /** @format uint256 */
  balance: number;

  /** @format uint256 */
  lockedBalance: number;
  utxoNum: number;
}

export interface Group {
  group: number;
}

export interface HashesAtHeight {
  headers?: string[];
}

export interface ChainInfo {
  currentHeight: number;
}

export interface BuildTransactionResult {
  unsignedTx: string;
  txId: string;
  fromGroup: number;
  toGroup: number;
}

export interface SendTransaction {
  unsignedTx: string;
  signature: string;
}

export interface TxResult {
  txId: string;
  fromGroup: number;
  toGroup: number;
}

export type TxStatus = Confirmed | MemPooled | NotFound1;

export interface Confirmed {
  blockHash: string;
  blockIndex: number;
  chainConfirmations: number;
  fromGroupConfirmations: number;
  toGroupConfirmations: number;
}

export type MemPooled = object;

export type NotFound1 = object;

export interface SendContract {
  code: string;
  tx: string;
  signature: string;
  fromGroup: number;
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

export interface BuildContract {
  fromKey: string;
  code: string;
}

export interface BuildContractResult {
  unsignedTx: string;
  hash: string;
  fromGroup: number;
  toGroup: number;
}

export interface MinerAddresses {
  addresses?: string[];
}

export interface BlockCandidate {
  deps?: string[];
  target: string;
  blockTs: number;
  txsHash: string;
  transactions?: string[];
}

export interface BlockSolution {
  blockDeps?: string[];
  timestamp: number;
  fromGroup: number;
  toGroup: number;

  /** @format uint256 */
  miningCount: number;
  target: string;

  /** @format uint256 */
  nonce: number;
  txsHash: string;
  transactions?: string[];
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
  public baseUrl: string = "http://{host}:{port}";
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
      r.data = (null as unknown) as T;
      r.error = (null as unknown) as E;

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
 * @baseUrl http://{host}:{port}
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
      this.request<WalletStatus[], BadRequest | Unauthorized | NotFound>({
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
      this.request<Result1, BadRequest | Unauthorized | NotFound>({
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
      this.request<Result, BadRequest | Unauthorized | NotFound>({
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
     * @name PostWalletsWalletNameLock
     * @summary Lock your wallet
     * @request POST:/wallets/{wallet_name}/lock
     */
    postWalletsWalletNameLock: (walletName: string, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound>({
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
      this.request<void, BadRequest | Unauthorized | NotFound>({
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
     * @name DeleteWalletsWalletName
     * @summary Delete your wallet file (can be recovered with your mnemonic)
     * @request DELETE:/wallets/{wallet_name}
     */
    deleteWalletsWalletName: (walletName: string, data: WalletDeletion, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound>({
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
     * @name GetWalletsWalletNameBalances
     * @summary Get your total balance
     * @request GET:/wallets/{wallet_name}/balances
     */
    getWalletsWalletNameBalances: (walletName: string, params: RequestParams = {}) =>
      this.request<Balances, BadRequest | Unauthorized | NotFound>({
        path: `/wallets/${walletName}/balances`,
        method: "GET",
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
      this.request<Result2, BadRequest | Unauthorized | NotFound>({
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
     * @name GetWalletsWalletNameAddresses
     * @summary List all your wallet's addresses
     * @request GET:/wallets/{wallet_name}/addresses
     */
    getWalletsWalletNameAddresses: (walletName: string, params: RequestParams = {}) =>
      this.request<Addresses, BadRequest | Unauthorized | NotFound>({
        path: `/wallets/${walletName}/addresses`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint can only be called if the wallet was created with the `miner = true` flag
     *
     * @tags Miners
     * @name GetWalletsWalletNameMinerAddresses
     * @summary List all miner addresses per group
     * @request GET:/wallets/{wallet_name}/miner-addresses
     */
    getWalletsWalletNameMinerAddresses: (walletName: string, params: RequestParams = {}) =>
      this.request<MinerAddressesInfo[], BadRequest | Unauthorized | NotFound>({
        path: `/wallets/${walletName}/miner-addresses`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Cannot be called from a miner wallet
     *
     * @tags Wallets
     * @name PostWalletsWalletNameDerivenextaddress
     * @summary Derive your next address
     * @request POST:/wallets/{wallet_name}/deriveNextAddress
     */
    postWalletsWalletNameDerivenextaddress: (walletName: string, params: RequestParams = {}) =>
      this.request<string, BadRequest | Unauthorized | NotFound>({
        path: `/wallets/${walletName}/deriveNextAddress`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Your wallet need to have been created with the miner flag set to true
     *
     * @tags Miners
     * @name PostWalletsWalletNameDerivenextmineraddresses
     * @summary Derive your next miner addresses for each group
     * @request POST:/wallets/{wallet_name}/deriveNextMinerAddresses
     */
    postWalletsWalletNameDerivenextmineraddresses: (walletName: string, params: RequestParams = {}) =>
      this.request<AddressInfo[], BadRequest | Unauthorized | NotFound>({
        path: `/wallets/${walletName}/deriveNextMinerAddresses`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameChangeactiveaddress
     * @summary Choose the active address
     * @request POST:/wallets/{wallet_name}/changeActiveAddress
     */
    postWalletsWalletNameChangeactiveaddress: (
      walletName: string,
      data: ChangeActiveAddress,
      params: RequestParams = {},
    ) =>
      this.request<void, BadRequest | Unauthorized | NotFound>({
        path: `/wallets/${walletName}/changeActiveAddress`,
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
  };
  addresses = {
    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressBalance
     * @summary Get the balance of a address
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
     * @name GetAddressesAddressGroup
     * @summary Get the group of a address
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
    getTransactionsUnconfirmed: (query: { fromGroup: number; toGroup: number }, params: RequestParams = {}) =>
      this.request<Tx[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/unconfirmed`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Transactions
     * @name GetTransactionsBuild
     * @summary Build an unsigned transaction
     * @request GET:/transactions/build
     */
    getTransactionsBuild: (
      query: { fromKey: string; toAddress: string; lockTime?: number; value: string },
      params: RequestParams = {},
    ) =>
      this.request<
        BuildTransactionResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/build`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsSend
     * @summary Send a signed transaction
     * @request POST:/transactions/send
     */
    postTransactionsSend: (data: SendTransaction, params: RequestParams = {}) =>
      this.request<TxResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/send`,
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
    getTransactionsStatus: (query: { txId: string; fromGroup: number; toGroup: number }, params: RequestParams = {}) =>
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
     * @name PostContractsSend
     * @summary Send a signed smart contract
     * @request POST:/contracts/send
     */
    postContractsSend: (data: SendContract, params: RequestParams = {}) =>
      this.request<TxResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/send`,
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

    /**
     * No description
     *
     * @tags Miners
     * @name GetMinersBlockCandidate
     * @summary Get the next block candidate for a chain
     * @request GET:/miners/block-candidate
     */
    getMinersBlockCandidate: (query: { fromGroup: number; toGroup: number }, params: RequestParams = {}) =>
      this.request<BlockCandidate, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners/block-candidate`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Miners
     * @name PostMinersNewBlock
     * @summary Post a block solution
     * @request POST:/miners/new-block
     */
    postMinersNewBlock: (data: BlockSolution, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners/new-block`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
}
