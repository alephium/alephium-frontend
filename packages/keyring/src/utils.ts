import { KeyType } from '@alephium/web3'
import BN from 'bn.js'
import { ec as EC, eddsa as EdDSA } from 'elliptic'
import { bytesToHex } from 'ethereum-cryptography/utils'

const secp256k1 = new EC('secp256k1')
const secp256r1 = new EC('p256')
const ed25519 = new EdDSA('ed25519')

// TODO: Delete and use the one from @alephium/web3 when secrets are migrated to more secure types
// Uninstall elliptic and bn.js when this is done
export function publicKeyFromPrivateKey(privateKey: Uint8Array, _keyType?: KeyType): string {
  const keyType = _keyType ?? 'default'

  switch (keyType) {
    case 'default':
    case 'gl-secp256k1':
      return secp256k1.keyFromPrivate(privateKey).getPublic(true, 'hex')
    case 'gl-secp256r1':
    case 'gl-webauthn':
      return secp256r1.keyFromPrivate(privateKey).getPublic(true, 'hex')
    case 'gl-ed25519':
      return ed25519.keyFromSecret(bytesToHex(privateKey)).getPublic('hex')
    case 'bip340-schnorr':
      return secp256k1.g.mul(new BN(privateKey, 16)).encode('hex', true).slice(2)
  }
}
