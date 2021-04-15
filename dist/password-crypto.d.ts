export { _PasswordCrypto as PasswordCrypto };
declare const _PasswordCrypto: PasswordCrypto;
declare function PasswordCrypto(): void;
declare class PasswordCrypto {
    encrypt: (password: any, dataRaw: any) => string;
    decrypt: (password: any, payloadRaw: any) => string;
}
