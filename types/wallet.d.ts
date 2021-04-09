/// <reference types="node" />
declare const bip32: any;
declare const bip39: any;
declare const bs58: any;
declare const blake: any;
declare const utils: any;
declare const passwordCrypto: any;
declare class StoredState {
    seed: string;
    numberOfAddresses: number;
    activeAddressIndex: number;
    constructor(seed: Buffer, numberOfAddresses: number, activeAddressIndex: number);
}
declare class Wallet {
    seed: Buffer;
    address: string;
    publicKey: string;
    privateKey: string;
    constructor(seed: Buffer, address: string, publicKey: string, privateKey: string);
    encrypt(password: any): any;
}
declare function path(networkType: any): string;
declare function fromMnemonic(mnemonic: any, networkType: any): Wallet;
declare function fromSeed(seed: any, networkType: any): Wallet;
declare function walletGenerate(networkType: any): {
    mnemonic: any;
    wallet: Wallet;
};
declare function walletImport(seedPhrase: any, networkType: any): Wallet;
declare function walletOpen(password: any, data: any, networkType: any): Promise<Wallet>;
