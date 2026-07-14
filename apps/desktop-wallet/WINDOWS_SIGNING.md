# Windows code signing

How the Windows `.exe` is code-signed, why users may still see SmartScreen warnings,
and what to do about it. Read this before touching anything signing-related — the setup
is subtle and easy to misdiagnose.

> **Tracking issue:** [alephium/alephium-frontend#965 — Microsoft Defender SmartScreen warning on
> desktop wallet install](https://github.com/alephium/alephium-frontend/issues/965)

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

1. `package.json` → `build.win.sign` points electron-builder at
   [`.signWindows.js`](./.signWindows.js).
2. electron-builder calls that script once per artifact it needs to sign (the inner app `.exe`
   and the final installer).
3. The script downloads `CodeSignTool`, then for each file runs
   `CodeSignTool sign -username … -password … -credential_id … -totp_secret … -input_file_path …`,
   which uploads the file's hash to SSL.com, signs it in the cloud, and returns the signed binary.
4. The signature is timestamped via `http://ts.ssl.com` (so it stays valid after the cert expires).

`elevate.exe` is deliberately **skipped** — eSigner rejects it with a false-positive
"code object is a malware" error. See the comment in `.signWindows.js`.

`build.win.publisherName` is set to `Panda Software SA`; this must match the
**O**/`CN` of whatever cert you sign with, or electron-builder's post-sign verification fails.

### Required GitHub secrets

All four come from the SSL.com / eSigner account and are consumed in
[`.github/workflows/release-desktop.yml`](../../.github/workflows/release-desktop.yml) → the
"Build & release Windows Electron app" step, then read by `.signWindows.js`.

| Secret                       | What it is                                           |
| ---------------------------- | ---------------------------------------------------- |
| `WINDOWS_SIGN_USER_NAME`     | SSL.com account username                             |
| `WINDOWS_SIGN_PASSWORD`      | SSL.com account password                             |
| `WINDOWS_SIGN_CREDENTIAL_ID` | eSigner credential/certificate ID to sign with       |
| `WINDOWS_SIGN_TOTP_SECRET`   | TOTP secret for automated (headless) eSigner signing |

If any are missing the script calls `process.exit(1)` and the release fails — so a green Windows
release means signing **did** run.

### Release candidates are unsigned on purpose

For `-rc.*` tags the workflow unsets `build.win.sign` (the "Skip signing for rc
versions" step), so RC builds are intentionally unsigned and **will** warn. That's expected; don't
"fix" it.

## Why warnings still appear (OV vs EV)

The signature is valid, but Microsoft SmartScreen treats reputation differently by certificate tier:

| Cert tier             | Leaf cert policy OID | SmartScreen behavior                                                     |
| --------------------- | -------------------- | ------------------------------------------------------------------------ |
| **OV** (what we have) | `2.23.140.1.4.1`     | No automatic reputation. Warns until each binary earns enough downloads. |
| **EV**                | `2.23.140.1.3`       | **Immediate** reputation. No warning from the first download.            |

Because reputation is largely **per-binary-hash**, every new release starts from zero with an OV
cert, so the warning effectively never goes away for fresh releases. For a crypto wallet this is
actively harmful — the warning is indistinguishable from a malware/phishing alert.

## The fix: move to an EV certificate

EV code signing is the only reliable way to remove the warning on day one. SSL.com sells EV code
signing certs that work through the **same eSigner / CodeSignTool flow** we already use, so the
migration is mostly procurement + validation, not engineering:

1. Buy a **new** SSL.com **EV Code Signing** certificate. There is no in-place OV→EV upgrade — it's
   a separate order with stricter validation. The existing OV cert keeps signing meanwhile, so
   there's no downtime.
2. Rotate **two** GitHub secrets to the EV cert's eSigner credentials: `WINDOWS_SIGN_CREDENTIAL_ID`
   and `WINDOWS_SIGN_TOTP_SECRET`. `WINDOWS_SIGN_USER_NAME` / `WINDOWS_SIGN_PASSWORD` stay the same
   (same account).
3. Confirm `build.win.publisherName` in `package.json` still matches the EV cert's
   organization name (`Panda Software SA` unless the legal entity changed).
4. **No code changes** — `.signWindows.js` and the workflow are untouched.

Cut a non-rc release and verify (below). The warning should be gone immediately. Click-by-click
steps are in the [EV migration runbook](#ev-migration-runbook-sslcom).

### Alternative: Microsoft Trusted Signing

Microsoft's own service (~$10/month) also earns SmartScreen trust and is supported natively by
electron-builder **26+** via `azureSignOptions` (the desktop app is currently pinned to
electron-builder 25.x, so this path would first require upgrading back to 26, see
[ELECTRON_BUILDER.md](./ELECTRON_BUILDER.md)). It's cheaper but is a **different integration** —
you'd replace `.signWindows.js` with Azure config and complete Microsoft's org identity
validation (typically needs 3+ years of verifiable legal existence). Only worth it if the EV cert
cost is a blocker.

## EV migration runbook (SSL.com)

Step-by-step for moving the existing OV cert to EV. Tracked in
[#965](https://github.com/alephium/alephium-frontend/issues/965).

### Before you start

- **No OV→EV upgrade button exists** — it's a new EV order with its own, stricter validation. The
  current OV cert keeps signing the whole time; don't cancel it until EV is live and tested.
- **CI architecture does not change.** We already sign through eSigner cloud (not a USB token), so
  EV's hardware-key requirement is met by SSL.com's cloud HSM. `.signWindows.js` and the workflow
  stay as-is.
- **Budget funds.** A 1-year EV cert lists higher than the OV one (multi-year is cheaper per year);
  the account's prepaid funds may not cover it — be ready to deposit or pay by card at checkout.

### In the SSL.com dashboard

1. **Buy** → choose **EV Code Signing Certificate** (1-year, or multi-year for a lower per-year
   price).
2. ⚠️ **Choose cloud signing, not a token.** When asked how the private key is stored, pick
   **eSigner / cloud signing (cloud HSM)** — _not_ "ship USB token." A physical token would break
   headless CI signing. This is the single most important click.
3. **Complete EV validation** under the `Validations` tab — start this immediately, it's the slow
   part (a few days to ~2 weeks). Beyond the OV checks, EV vetting needs:
   - Legal-entity verification of Panda Software SA via the Swiss commercial register (Zefix).
   - Verified physical address / operational existence.
   - A **verification phone call** to a number SSL.com independently finds in a **public
     directory** — ensure Panda Software SA has a matching publicly-listed phone number (this is
     the usual blocker).
   - A designated **authorized signer** who accepts the EV subscriber agreement.
4. **Enroll the issued EV order in eSigner** (it shows under "esigner enrolled orders" like the OV
   one) and enable **automated signing**:
   - Save the **TOTP seed** — the base64 string, _not_ the rotating 6-digit code →
     `WINDOWS_SIGN_TOTP_SECRET`.
   - Get the **credential_id** from the eSigner order page, or run
     `CodeSignTool.bat get_credential_ids -username=<account>` → `WINDOWS_SIGN_CREDENTIAL_ID`.

### Confirm with SSL.com support (live-chat bubble, bottom-right)

- That **EV automated / headless signing via eSigner** is enabled for the account.
- Whether any in-progress identity verification must finish before EV org-validation can start.

### Then in this repo

1. Rotate `WINDOWS_SIGN_CREDENTIAL_ID` and `WINDOWS_SIGN_TOTP_SECRET` (repo → Settings → Secrets and
   variables → Actions). Leave username/password.
2. Cut a **non-rc** release.
3. Verify it flipped to EV with the commands below — the leaf policy OID must now be `2.23.140.1.3`.

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
before expiry keep verifying afterward — but you cannot sign _new_ releases with an expired cert.
Renew (ideally as EV) before then.
