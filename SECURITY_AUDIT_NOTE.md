# About npm audit vulnerabilities

## Does this cause the TestFlight white screen?

**No.** The 183 vulnerabilities are **security advisories** (known issues in some dependency versions). They do **not** cause your app to show a white screen or crash. The white screen was addressed by aligning package versions with Expo’s expected versions.

## What are these vulnerabilities?

- Many are in **devDependencies** (only used when you run `npm install` / build, not in the final app).
- Many are **transitive** (nested inside other packages); you can’t always change them without breaking Expo compatibility.
- They refer to things like: outdated packages with known CVEs; npm doesn’t know that Expo pins some of these for compatibility.

## What you should do

1. **Safe fix (recommended):**
   ```bash
   npm audit fix
   ```
   This updates only **safe** (non‑breaking) versions. It often clears a large number of reports. Run it after any `npm install`.

2. **Avoid unless you’re prepared for breakage:**
   ```bash
   npm audit fix --force   # Can upgrade to major versions and break Expo/React Native
   ```
   Don’t use this unless you’re ready to fix possible build/runtime issues.

3. **Expo compatibility comes first**  
   For this project, keeping the versions that match Expo SDK 53 (as in `package.json`) is more important than making the audit count zero. Some “vulnerable” versions are the ones Expo requires.

## Summary

- The warning is **not** the cause of the TestFlight white screen.
- Run `npm audit fix` when you can; some remaining vulnerabilities are acceptable in an Expo app and may need upstream/Expo updates to fix.
