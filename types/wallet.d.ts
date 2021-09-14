/// <reference types="node" />
declare class Wallet {
    seed: Buffer;
    address: string;
    publicKey: string;
    privateKey: string;
    constructor(seed: Buffer, address: string, publicKey: string, privateKey: string);
    encrypt(password: string): any;
}
declare function fromMnemonic(mnemonic: any, networkType: any): Wallet;
declare function fromSeed(seed: any, networkType: any): Wallet;
declare function walletGenerate(networkType: any): {
    mnemonic: any;
    wallet: Wallet;
};
declare function walletImport(seedPhrase: any, networkType: any): Wallet;
declare function walletOpen(password: any, data: any, networkType: any): Promise<Wallet>;
export { Wallet, walletGenerate as generate, walletImport as import, walletOpen as opan, fromMnemonic, fromSeed };
