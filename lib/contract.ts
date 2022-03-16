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

import * as cryptojs from 'crypto-js'
import * as crypto from 'crypto'
import bs58 from './bs58'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import { CliqueClient } from './clique'
import * as api from '../api/api-alephium'
import { Signer } from './signer'

export abstract class Common {
  readonly fileName: string
  readonly sourceCodeSha256: string
  readonly bytecode: string
  readonly codeHash: string
  readonly functions: api.Function[]

  static readonly importRegex = new RegExp('^import "[a-z][a-z_0-9]*.ral"', 'mg')
  static readonly contractRegex = new RegExp('^TxContract [A-Z][a-zA-Z0-9]*\\(', 'mg')
  static readonly scriptRegex = new RegExp('^TxScript [A-Z][a-zA-Z0-9]* \\{', 'mg')
  static readonly variableRegex = new RegExp('\\{\\{\\s+[a-z][a-zA-Z0-9]*\\s+\\}\\}', 'g')

  constructor(
    fileName: string,
    sourceCodeSha256: string,
    bytecode: string,
    codeHash: string,
    functions: api.Function[]
  ) {
    this.fileName = fileName
    this.sourceCodeSha256 = sourceCodeSha256
    this.bytecode = bytecode
    this.codeHash = codeHash
    this.functions = functions
  }

  protected static _contractPath(fileName: string): string {
    return `./contracts/${fileName}`
  }

  protected static _artifactPath(fileName: string): string {
    return `./artifacts/${fileName}.json`
  }

  protected static _artifactsFolder(): string {
    return './artifacts/'
  }

  static async handleImports(contractStr: string, importsCache: string[]): Promise<string> {
    const localImportsCache: string[] = []
    let result = contractStr.replace(Common.importRegex, (match) => {
      localImportsCache.push(match)
      return ''
    })
    for (const myImport of localImportsCache) {
      const fileName = myImport.slice(8, -1)
      if (!importsCache.includes(fileName)) {
        importsCache.push(fileName)
        const importContractStr = await Common._loadContractStr(fileName, importsCache, (code) =>
          Contract.checkCodeType(fileName, code)
        )
        result = result.concat('\n', importContractStr)
      }
    }
    return result
  }

  protected static _replaceVariables(contractStr: string, variables?: any): string {
    if (variables) {
      return contractStr.replace(Common.variableRegex, (match) => {
        const variableName = match.split(/(\s+)/)[2]
        if (variableName in variables) {
          return variables[variableName].toString()
        } else {
          throw new Error(`The value of variable ${variableName} is not provided`)
        }
      })
    } else {
      return contractStr
    }
  }

  protected static async _loadContractStr(
    fileName: string,
    importsCache: string[],
    validate: (fileName: string) => void
  ): Promise<string> {
    const contractPath = this._contractPath(fileName)
    const contractBuffer = await fsPromises.readFile(contractPath)
    const contractStr = contractBuffer.toString()

    validate(contractStr)
    return Common.handleImports(contractStr, importsCache)
  }

  static checkFileNameExtension(fileName: string): void {
    if (!fileName.endsWith('.ral')) {
      throw new Error('Smart contract file name should end with ".ral"')
    }
  }

  protected static async _from<T extends { sourceCodeSha256: string }>(
    client: CliqueClient,
    fileName: string,
    loadContractStr: (fileName: string, importsCache: string[]) => Promise<string>,
    loadContract: (fileName: string) => Promise<T>,
    __from: (client: CliqueClient, fileName: string, contractStr: string, contractHash: string) => Promise<T>
  ): Promise<T> {
    Common.checkFileNameExtension(fileName)

    const contractStr = await loadContractStr(fileName, [])
    const contractHash = cryptojs.SHA256(contractStr).toString()
    try {
      const existingContract = await loadContract(fileName)
      return existingContract.sourceCodeSha256 === contractHash
        ? existingContract
        : __from(client, fileName, contractStr, contractHash)
    } catch (_) {
      return __from(client, fileName, contractStr, contractHash)
    }
  }

  static async load(fileName: string): Promise<Contract | Script> {
    return Contract.loadContract(fileName).catch(() => Script.loadContract(fileName))
  }

  protected _saveToFile(): Promise<void> {
    const artifactPath = Common._artifactPath(this.fileName)
    return fsPromises.writeFile(artifactPath, this.toString())
  }
}

export class Contract extends Common {
  readonly fields: api.Fields
  readonly events: api.Event[]

  // cache address for contracts
  private _contractAddresses: Map<string, string>

  constructor(
    fileName: string,
    sourceCodeSha256: string,
    bytecode: string,
    codeHash: string,
    fields: api.Fields,
    functions: api.Function[],
    events: api.Event[]
  ) {
    super(fileName, sourceCodeSha256, bytecode, codeHash, functions)
    this.fields = fields
    this.events = events

    this._contractAddresses = new Map<string, string>()
  }

  static checkCodeType(fileName: string, contractStr: string): void {
    const contractMatches = contractStr.match(Contract.contractRegex)
    if (contractMatches === null) {
      throw new Error(`No contract found in: ${fileName}`)
    } else if (contractMatches!.length > 1) {
      throw new Error(`Multiple contracts in: ${fileName}`)
    } else {
      return
    }
  }

  static async loadContractStr(fileName: string, importsCache: string[], variables?: any): Promise<string> {
    const result = await Common._loadContractStr(fileName, importsCache, (code) =>
      Contract.checkCodeType(fileName, code)
    )
    return Common._replaceVariables(result, variables)
  }

  static async from(client: CliqueClient, fileName: string, variables?: any): Promise<Contract> {
    if (!fs.existsSync(Common._artifactsFolder())) {
      fs.mkdirSync(Common._artifactsFolder(), { recursive: true })
    }
    return Common._from(
      client,
      fileName,
      (fileName, importCaches) => Contract.loadContractStr(fileName, importCaches, variables),
      Contract.loadContract,
      Contract.__from
    )
  }

  private static async __from(
    client: CliqueClient,
    fileName: string,
    contractStr: string,
    contractHash: string
  ): Promise<Contract> {
    const compiled = (await client.contracts.postContractsCompileContract({ code: contractStr })).data
    const artifact = new Contract(
      fileName,
      contractHash,
      compiled.bytecode,
      compiled.codeHash,
      compiled.fields,
      compiled.functions,
      compiled.events
    )
    await artifact._saveToFile()
    return artifact
  }

  static async loadContract(fileName: string): Promise<Contract> {
    const artifactPath = Contract._artifactPath(fileName)
    const content = await fsPromises.readFile(artifactPath)
    const artifact = JSON.parse(content.toString())
    if (artifact.bytecode == null || artifact.fields == null || artifact.functions == null || artifact.events == null) {
      throw new Event('Compilation did not return the right data')
    }
    return new Contract(
      fileName,
      artifact.sourceCodeSha256,
      artifact.bytecode,
      artifact.codeHash,
      artifact.fields,
      artifact.functions,
      artifact.events
    )
  }

  toString(): string {
    return JSON.stringify(
      {
        sourceCodeSha256: this.sourceCodeSha256,
        bytecode: this.bytecode,
        codeHash: this.codeHash,
        fields: this.fields,
        functions: this.functions,
        events: this.events
      },
      null,
      2
    )
  }

  toState(fields: Val[], asset: Asset, address: string): ContractState {
    return {
      fileName: this.fileName,
      address: address,
      bytecode: this.bytecode,
      codeHash: this.codeHash,
      fields: fields,
      fieldTypes: this.fields.types,
      asset: asset
    }
  }

  static randomAddress(): string {
    const bytes = crypto.randomBytes(33)
    bytes[0] = 3
    return bs58.encode(bytes)
  }

  private _randomAddressWithCache(fileName: string): string {
    const address = Contract.randomAddress()
    this._contractAddresses.set(address, fileName)
    return address
  }

  async test(client: CliqueClient, funcName: string, params: TestContractParams): Promise<TestContractResult> {
    this._contractAddresses.clear()
    const apiParams: api.TestContract = this.toTestContract(funcName, params)
    const response = await client.contracts.postContractsTestContract(apiParams)
    const methodIndex = params.testMethodIndex ? params.testMethodIndex : 0
    const result = await this.fromTestContractResult(methodIndex, response.data)
    this._contractAddresses.clear()
    return result
  }

  toApiFields(fields?: Val[]): api.Val[] {
    return fields ? toApiFields(fields!, this.fields.types) : []
  }

  toApiArgs(funcName: string, args?: Val[]): api.Val[] {
    if (args) {
      const func = this.functions.find((func) => func.name == funcName)
      if (func == null) {
        throw new Error(`Invalid function name: ${funcName}`)
      }

      if (args.length === func.argTypes.length) {
        return args.map((arg, index) => toApiVal(arg, func.argTypes[index]))
      } else {
        throw new Error(`Invalid number of arguments: ${args}`)
      }
    } else {
      return []
    }
  }

  getMethodIndex(funcName: string): number {
    return this.functions.findIndex((func) => func.name === funcName)
  }

  toApiContractState(state: ContractState): api.ContractState {
    if (state.address) {
      this._contractAddresses.set(state.address, state.fileName)
      return toApiContractState(state, state.address)
    } else {
      const address = this._randomAddressWithCache(state.fileName)
      return toApiContractState(state, address)
    }
  }

  toApiContractStates(states?: ContractState[]): api.ContractState[] | undefined {
    return states ? states.map((state) => this.toApiContractState(state)) : undefined
  }

  toTestContract(funcName: string, params: TestContractParams): api.TestContract {
    const address: string = params.address
      ? (this._contractAddresses.set(params.address, this.fileName), params.address)
      : this._randomAddressWithCache(this.fileName)
    return {
      group: params.group,
      address: address,
      bytecode: this.bytecode,
      initialFields: this.toApiFields(params.initialFields),
      initialAsset: params.initialAsset ? toApiAsset(params.initialAsset) : undefined,
      testMethodIndex: this.getMethodIndex(funcName),
      testArgs: this.toApiArgs(funcName, params.testArgs),
      existingContracts: this.toApiContractStates(params.existingContracts),
      inputAssets: toApiInputAssets(params.inputAssets)
    }
  }

  static async getContract(codeHash: string): Promise<Contract> {
    const files = await fsPromises.readdir(Common._artifactsFolder())
    for (const file of files) {
      if (file.endsWith('.ral.json')) {
        const fileName = file.slice(0, -5)
        const contract = await Common.load(fileName)
        if (contract.codeHash === codeHash) {
          return contract as Contract
        }
      }
    }

    throw new Error(`Unknown code with codeHash: ${codeHash}`)
  }

  static async getFieldTypes(codeHash: string): Promise<string[]> {
    return Contract.getContract(codeHash).then((contract) => contract.fields.types)
  }

  async fromApiContractState(state: api.ContractState): Promise<ContractState> {
    const contract = await Contract.getContract(state.codeHash)
    return {
      fileName: contract.fileName,
      address: state.address,
      bytecode: state.bytecode,
      codeHash: state.codeHash,
      fields: fromApiVals(state.fields, contract.fields.types),
      fieldTypes: await Contract.getFieldTypes(state.codeHash),
      asset: fromApiAsset(state.asset)
    }
  }

  static async fromApiEvent(event: api.Event1, fileName: string): Promise<Event> {
    const contract = await Contract.loadContract(fileName)
    const eventDef = await contract.events[event.eventIndex]
    return {
      blockHash: event.blockHash,
      contractAddress: event.contractAddress,
      txId: event.txId,
      name: eventDef.name,
      fields: fromApiVals(event.fields, eventDef.fieldTypes)
    }
  }

  async fromTestContractResult(methodIndex: number, result: api.TestContractResult): Promise<TestContractResult> {
    return {
      returns: fromApiVals(result.returns, this.functions[methodIndex].returnTypes),
      gasUsed: result.gasUsed,
      contracts: await Promise.all(result.contracts.map((contract) => this.fromApiContractState(contract))),
      txOutputs: result.txOutputs.map(fromApiOutput),
      events: await Promise.all(
        result.events.map((event) => {
          return Contract.fromApiEvent(event, this._contractAddresses.get(event.contractAddress)!)
        })
      )
    }
  }

  async transactionForDeployment(signer: Signer, initialFields?: Val[]): Promise<DeployContractTransaction> {
    const params: api.BuildContractDeployScriptTx = {
      fromPublicKey: await signer.getPublicKey(),
      bytecode: this.bytecode,
      initialFields: this.toApiFields(initialFields)
    }
    const response = await signer.client.contracts.postContractsUnsignedTxBuildContract(params)
    return fromApiDeployContractUnsignedTx(CliqueClient.convert(response))
  }
}

export class Script extends Common {
  constructor(
    fileName: string,
    sourceCodeSha256: string,
    bytecode: string,
    codeHash: string,
    functions: api.Function[]
  ) {
    super(fileName, sourceCodeSha256, bytecode, codeHash, functions)
  }

  static checkCodeType(fileName: string, contractStr: string): void {
    const scriptMatches = contractStr.match(this.scriptRegex)
    if (scriptMatches === null) {
      throw new Error(`No script found in: ${fileName}`)
    } else if (scriptMatches.length > 1) {
      throw new Error(`Multiple scripts in: ${fileName}`)
    } else {
      return
    }
  }

  static async loadContractStr(fileName: string, importsCache: string[], variables?: any): Promise<string> {
    const result = await Common._loadContractStr(fileName, importsCache, (code) => Script.checkCodeType(fileName, code))
    return await Common._replaceVariables(result, variables)
  }

  static async from(client: CliqueClient, fileName: string, variables?: any): Promise<Script> {
    return Common._from(
      client,
      fileName,
      (fileName, importsCache) => Script.loadContractStr(fileName, importsCache, variables),
      Script.loadContract,
      Script.__from
    )
  }

  private static async __from(
    client: CliqueClient,
    fileName: string,
    scriptStr: string,
    contractHash: string
  ): Promise<Script> {
    const compiled = (await client.contracts.postContractsCompileScript({ code: scriptStr })).data
    const artifact = new Script(fileName, contractHash, compiled.bytecode, compiled.codeHash, compiled.functions)
    await artifact._saveToFile()
    return artifact
  }

  static async loadContract(fileName: string): Promise<Script> {
    const artifactPath = Common._artifactPath(fileName)
    const content = await fsPromises.readFile(artifactPath)
    const artifact = JSON.parse(content.toString())
    if (artifact.bytecode == null || artifact.functions == null) {
      throw new Event('= Compilation did not return the right data')
    }
    return new Script(fileName, artifact.sourceCodeSha256, artifact.bytecode, artifact.codeHash, artifact.functions)
  }

  toString(): string {
    return JSON.stringify(
      {
        sourceCodeSha256: this.sourceCodeSha256,
        bytecode: this.bytecode,
        codeHash: this.codeHash,
        functions: this.functions
      },
      null,
      2
    )
  }

  async transactionForDeployment(signer: Signer, params?: BuildScriptTx): Promise<BuildScriptTxResult> {
    const apiParams: api.BuildScriptTx = {
      fromPublicKey: await signer.getPublicKey(),
      bytecode: this.bytecode,
      alphAmount: params && params.alphAmount ? extractNumber256(params.alphAmount) : undefined,
      tokens: params && params.tokens ? params.tokens.map(toApiToken) : undefined,
      gas: params && params.gas ? params.gas : undefined,
      gasPrice: params && params.gasPrice ? extractNumber256(params.gasPrice) : undefined,
      utxosLimit: params && params.utxosLimit ? params.utxosLimit : undefined
    }
    const response = await signer.client.contracts.postContractsUnsignedTxBuildScript(apiParams)
    return CliqueClient.convert(response)
  }
}

export type Number256 = number | bigint
export type Val = Number256 | boolean | string | Val[]

function extractBoolean(v: Val): boolean {
  if (typeof v === 'boolean') {
    return v
  } else {
    throw new Error(`Invalid boolean value: ${v}`)
  }
}

// TODO: check integer bounds
function extractNumber256(v: Val): string {
  if ((typeof v === 'number' && Number.isInteger(v)) || typeof v === 'bigint') {
    return v.toString()
  } else if (typeof v === 'string') {
    return v
  } else {
    throw new Error(`Invalid 256 bit number: ${v}`)
  }
}

// TODO: check hex string
function extractByteVec(v: Val): string {
  if (typeof v === 'string') {
    // try to convert from address to contract id
    try {
      const address = bs58.decode(v)
      if (address.length == 33 && address[0] == 3) {
        return Buffer.from(address.slice(1)).toString('hex')
      }
    } catch (_) {
      return v as string
    }
    return v as string
  } else {
    throw new Error(`Invalid string: ${v}`)
  }
}

function extractBs58(v: Val): string {
  if (typeof v === 'string') {
    try {
      bs58.decode(v)
      return v as string
    } catch (error) {
      throw new Error(`Invalid base58 string: ${v}`)
    }
  } else {
    throw new Error(`Invalid string: ${v}`)
  }
}

function decodeNumber256(n: string): Number256 {
  if (Number.isSafeInteger(Number.parseInt(n))) {
    return Number(n)
  } else {
    return BigInt(n)
  }
}

export function extractArray(tpe: string, v: Val): api.Val {
  if (!Array.isArray(v)) {
    throw new Error(`Expected array, got ${v}`)
  }

  const semiColonIndex = tpe.lastIndexOf(';')
  if (semiColonIndex == -1) {
    throw new Error(`Invalid Val type: ${tpe}`)
  }

  const subType = tpe.slice(1, semiColonIndex)
  const dim = parseInt(tpe.slice(semiColonIndex + 1, -1))
  if ((v as Val[]).length != dim) {
    throw new Error(`Invalid val dimension: ${v}`)
  } else {
    return { value: (v as Val[]).map((v) => toApiVal(v, subType)), type: 'Array' }
  }
}

function toApiVal(v: Val, tpe: string): api.Val {
  if (tpe === 'Bool') {
    return { value: extractBoolean(v), type: tpe }
  } else if (tpe === 'U256' || tpe === 'I256') {
    return { value: extractNumber256(v), type: tpe }
  } else if (tpe === 'ByteVec') {
    return { value: extractByteVec(v), type: tpe }
  } else if (tpe === 'Address') {
    return { value: extractBs58(v), type: tpe }
  } else {
    return extractArray(tpe, v)
  }
}

function decodeArrayType(tpe: string): [baseType: string, dims: number[]] {
  const semiColonIndex = tpe.lastIndexOf(';')
  if (semiColonIndex === -1) {
    throw new Error(`Invalid Val type: ${tpe}`)
  }

  const subType = tpe.slice(1, semiColonIndex)
  const dim = parseInt(tpe.slice(semiColonIndex + 1, -1))
  if (subType[0] == '[') {
    const [baseType, subDim] = decodeArrayType(subType)
    return [baseType, (subDim.unshift(dim), subDim)]
  } else {
    return [subType, [dim]]
  }
}

function foldVals(vals: Val[], dims: number[]): Val {
  if (dims.length == 1) {
    return vals
  } else {
    const result: Val[] = []
    const chunkSize = vals.length / dims[0]
    const chunkDims = dims.slice(1)
    for (let i = 0; i < vals.length; i += chunkSize) {
      const chunk = vals.slice(i, i + chunkSize)
      result.push(foldVals(chunk, chunkDims))
    }
    return result
  }
}

function _fromApiVal(vals: api.Val[], valIndex: number, tpe: string): [result: Val, nextIndex: number] {
  if (vals.length === 0) {
    throw new Error('Not enough Vals')
  }

  const firstVal = vals[valIndex]
  if (tpe === 'Bool' && firstVal.type === tpe) {
    return [firstVal.value as boolean, valIndex + 1]
  } else if ((tpe === 'U256' || tpe === 'I256') && firstVal.type === tpe) {
    return [decodeNumber256(firstVal.value as string), valIndex + 1]
  } else if ((tpe === 'ByteVec' || tpe === 'Address') && firstVal.type === tpe) {
    return [firstVal.value as string, valIndex + 1]
  } else {
    const [baseType, dims] = decodeArrayType(tpe)
    const arraySize = dims.reduce((a, b) => a * b)
    const nextIndex = valIndex + arraySize
    const valsToUse = vals.slice(valIndex, nextIndex)
    if (valsToUse.length == arraySize && valsToUse.every((val) => val.type === baseType)) {
      const localVals = valsToUse.map((val) => fromApiVal(val, baseType))
      return [foldVals(localVals, dims), nextIndex]
    } else {
      throw new Error(`Invalid array Val type: ${valsToUse}, ${tpe}`)
    }
  }
}

function fromApiVals(vals: api.Val[], types: string[]): Val[] {
  let valIndex = 0
  const result: Val[] = []
  for (const currentType of types) {
    const [val, nextIndex] = _fromApiVal(vals, valIndex, currentType)
    result.push(val)
    valIndex = nextIndex
  }
  return result
}

function fromApiVal(v: api.Val, tpe: string): Val {
  if (v.type === 'Bool' && v.type === tpe) {
    return v.value as boolean
  } else if ((v.type === 'U256' || v.type === 'I256') && v.type === tpe) {
    return decodeNumber256(v.value as string)
  } else if ((v.type === 'ByteVec' || v.type === 'Address') && v.type === tpe) {
    return v.value as string
  } else {
    throw new Error(`Invalid api.Val type: ${v}`)
  }
}

export interface Asset {
  alphAmount: Number256
  tokens?: Token[]
}

export interface Token {
  id: string
  amount: Number256
}

function toApiToken(token: Token): api.Token {
  return { id: token.id, amount: extractNumber256(token.amount) }
}

function fromApiToken(token: api.Token): Token {
  return { id: token.id, amount: decodeNumber256(token.amount) }
}

function toApiAsset(asset: Asset): api.Asset2 {
  return {
    alphAmount: extractNumber256(asset.alphAmount),
    tokens: asset.tokens ? asset.tokens.map(toApiToken) : []
  }
}

function fromApiAsset(asset: api.Asset2): Asset {
  return {
    alphAmount: decodeNumber256(asset.alphAmount),
    tokens: asset.tokens ? asset.tokens.map(fromApiToken) : undefined
  }
}

export interface InputAsset {
  address: string
  asset: Asset
}

export interface ContractState {
  fileName: string
  address: string
  bytecode: string
  codeHash: string
  fields: Val[]
  fieldTypes: string[]
  asset: Asset
}

function toApiContractState(state: ContractState, address: string): api.ContractState {
  return {
    address: address,
    bytecode: state.bytecode,
    codeHash: state.codeHash,
    fields: toApiFields(state.fields, state.fieldTypes),
    asset: toApiAsset(state.asset)
  }
}

function toApiFields(fields: Val[], fieldTypes: string[]): api.Val[] {
  if (fields.length === fieldTypes.length) {
    return fields.map((field, index) => toApiVal(field, fieldTypes[index]))
  } else {
    throw new Error(`Invalid number of fields: ${fields}`)
  }
}

function toApiInputAsset(inputAsset: InputAsset): api.InputAsset {
  return { address: inputAsset.address, asset: toApiAsset(inputAsset.asset) }
}

function toApiInputAssets(inputAssets?: InputAsset[]): api.InputAsset[] | undefined {
  return inputAssets ? inputAssets.map(toApiInputAsset) : undefined
}

export interface TestContractParams {
  group?: number // default 0
  address?: string
  initialFields?: Val[] // default no fields
  initialAsset?: Asset // default 1 ALPH
  testMethodIndex?: number // default 0
  testArgs?: Val[] // default no arguments
  existingContracts?: ContractState[] // default no existing contracts
  inputAssets?: InputAsset[] // default no input asserts
}

export interface Event {
  blockHash: string
  contractAddress: string
  txId: string
  name: string
  fields: Val[]
}

export interface TestContractResult {
  returns: Val[]
  gasUsed: number
  contracts: ContractState[]
  txOutputs: Output[]
  events: Event[]
}
export declare type Output = AssetOutput | ContractOutput
export interface AssetOutput extends Asset {
  type: string
  address: string
  lockTime: number
  additionalData: string
}
export interface ContractOutput {
  type: string
  address: string
  alphAmount: Number256
  tokens: Token[]
}

function fromApiOutput(output: api.Output): Output {
  if (output.type === 'Asset') {
    const asset = output as api.Asset1
    return {
      type: 'AssetOutput',
      address: asset.address,
      alphAmount: decodeNumber256(asset.alphAmount),
      tokens: asset.tokens.map(fromApiToken),
      lockTime: asset.lockTime,
      additionalData: asset.additionalData
    }
  } else if (output.type === 'Contract') {
    const asset = output as api.Contract1
    return {
      type: 'ContractOutput',
      address: asset.address,
      alphAmount: decodeNumber256(asset.alphAmount),
      tokens: asset.tokens.map(fromApiToken)
    }
  } else {
    throw new Error(`Unknown output type: ${output}`)
  }
}

export interface DeployContractTransaction {
  group: number
  unsignedTx: string
  txId: string
  contractAddress: string
}

function fromApiDeployContractUnsignedTx(result: api.BuildContractDeployScriptTxResult): DeployContractTransaction {
  return result
}

export interface BuildScriptTx {
  alphAmount?: Number256
  tokens?: Token[]
  gas?: number
  gasPrice?: Number256
  utxosLimit?: number
}

export interface BuildScriptTxResult {
  unsignedTx: string
  txId: string
  group: number
}
