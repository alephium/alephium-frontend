# Windows code signing

How the Windows `.exe` is code-signed, why users may still see SmartScreen warnings,
and what to do about it. Read this before touching anything signing-related — the setup
is subtle and easy to misdiagnose.

## TL;DR

- The released `.exe` **is** correctly signed (valid Authenticode signature, properly timestamped).
- The certificate is an **OV** (Organization Validation) cert from SSL.com, issued to `Panda Software SA`.
- **OV certs do not get automatic Microsoft SmartScreen reputation.** Only **EV** certs do.
- Result: Windows shows "Windows protected your PC" and Edge shows "Publisher: Unknown" on every
  release, until that exact binary slowly earns download reputation. Each new version resets this.
- **Fix:** swap the SSL.com OV cert for an SSL.com **EV** cert. The signing pipeline below stays
  identical — you only rotate the four `WINDOWS_SIGN_*` GitHub secrets.

## How signing works today

Signing is done through **SSL.com's eSigner cloud signing** via their `CodeSignTool` CLI — there is
no certificate file on disk and no hardware token in CI. The flow:

1. `package.json` → `build.win.signtoolOptions.sign` points electron-builder at
   [`.signWindows.js`](./.signWindows.js).
2. electron-builder calls that script once per artifact it needs to sign (the inner app `.exe`
   and the final installer).
3. The script downloads `CodeSignTool`, then for each file runs
   `CodeSignTool sign -username … -password … -credential_id … -totp_secret … -input_file_path …`,
   which uploads the file's hash to SSL.com, signs it in the cloud, and returns the signed binary.
4. The signature is timestamped via `http://ts.ssl.com` (so it stays valid after the cert expires).

`elevate.exe` is deliberately **skipped** — eSigner rejects it with a false-positive
"code object is a malware" error. See the comment in `.signWindows.js`.

`build.win.signtoolOptions.publisherName` is set to `Panda Software SA`; this must match the
**O**/`CN` of whatever cert you sign with, or electron-builder's post-sign verification fails.

### Required GitHub secrets

All four come from the SSL.com / eSigner account and are consumed in
[`.github/workflows/release-desktop.yml`](../../.github/workflows/release-desktop.yml) → the
"Build & release Windows Electron app" step, then read by `.signWindows.js`.

| Secret | What it is |
| --- | --- |
| `WINDOWS_SIGN_USER_NAME` | SSL.com account username |
| `WINDOWS_SIGN_PASSWORD` | SSL.com account password |
| `WINDOWS_SIGN_CREDENTIAL_ID` | eSigner credential/certificate ID to sign with |
| `WINDOWS_SIGN_TOTP_SECRET` | TOTP secret for automated (headless) eSigner signing |

If any are missing the script calls `process.exit(1)` and the release fails — so a green Windows
release means signing **did** run.

### Release candidates are unsigned on purpose

For `-rc.*` tags the workflow unsets `build.win.signtoolOptions.sign` (the "Skip signing for rc
versions" step), so RC builds are intentionally unsigned and **will** warn. That's expected; don't
"fix" it.

## Why warnings still appear (OV vs EV)

The signature is valid, but Microsoft SmartScreen treats reputation differently by certificate tier:

| Cert tier | Leaf cert policy OID | SmartScreen behavior |
| --- | --- | --- |
| **OV** (what we have) | `2.23.140.1.4.1` | No automatic reputation. Warns until each binary earns enough downloads. |
| **EV** | `2.23.140.1.3` | **Immediate** reputation. No warning from the first download. |

Because reputation is largely **per-binary-hash**, every new release starts from zero with an OV
cert, so the warning effectively never goes away for fresh releases. For a crypto wallet this is
actively harmful — the warning is indistinguishable from a malware/phishing alert.

## The fix: move to an EV certificate

EV code signing is the only reliable way to remove the warning on day one. SSL.com sells EV code
signing certs that work through the **same eSigner / CodeSignTool flow** we already use, so:

1. Buy (or upgrade the existing OV cert to) an **SSL.com EV code signing certificate**.
2. Rotate the four `WINDOWS_SIGN_*` GitHub secrets to the EV cert's eSigner credentials.
3. Confirm `build.win.signtoolOptions.publisherName` in `package.json` still matches the EV cert's
   organization name (`Panda Software SA` unless the legal entity changed).
4. **No code changes** — `.signWindows.js` and the workflow are untouched.

Cut a non-rc release and verify (below). The warning should be gone immediately.

### Alternative: Microsoft Trusted Signing

Microsoft's own service (~$10/month) also earns SmartScreen trust and is supported natively by
electron-builder 26 via `azureSignOptions`. It's cheaper but is a **different integration** —
you'd replace `.signWindows.js` with Azure config and complete Microsoft's org identity
validation (typically needs 3+ years of verifiable legal existence). Only worth it if the EV cert
cost is a blocker.

## Verifying a signed binary

You don't need Windows. On macOS/Linux with `osslsigncode` (`brew install osslsigncode`):

```shell
# 1. Is it signed and untampered? Look for "Signature verification: ok".
osslsigncode verify Alephium-<version>.exe

# 2. OV or EV? Check the leaf cert's policy OID.
osslsigncode extract-signature -in Alephium-<version>.exe -out sig.der
openssl pkcs7 -inform DER -in sig.der -print_certs -text | grep -A3 "Certificate Policies"
#   2.23.140.1.4.1  -> OV  (will warn)
#   2.23.140.1.3    -> EV  (no warning)
```

Last verified on `Alephium-3.2.2.exe`: signature **ok**, signer `Panda Software SA` (SSL.com),
cert valid Aug 2025 → Aug 2026, policy OID `2.23.140.1.4.1` → **OV**.

## Renewal

The current cert expires **Aug 14 2026**. Because signatures are timestamped, binaries signed
before expiry keep verifying afterward — but you cannot sign *new* releases with an expired cert.
Renew (ideally as EV) before then.
