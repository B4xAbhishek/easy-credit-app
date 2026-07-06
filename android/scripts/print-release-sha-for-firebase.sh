#!/usr/bin/env bash
# Prints SHA-1 and SHA-256 (colon-separated, Firebase-style) for the current release APK.
# Usage: from repo root or SmartKreditApp: ./android/scripts/print-release-sha-for-firebase.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APK="${ROOT}/app/build/outputs/apk/release/app-release.apk"
if [[ ! -f "$APK" ]]; then
  echo "Build release first: cd android && ./gradlew assembleRelease" >&2
  exit 1
fi
APKSIGNER=""
for d in "${ANDROID_HOME:-$HOME/Library/Android/sdk}/build-tools"/*/apksigner; do
  [[ -x "$d" ]] && APKSIGNER="$d" && break
done
if [[ -z "$APKSIGNER" ]]; then
  echo "apksigner not found. Install Android SDK build-tools or set ANDROID_HOME." >&2
  exit 1
fi
hex_to_colon() {
  echo "$1" | sed 's/\(..\)/\1:/g; s/:$//' | tr 'a-f' 'A-F'
}
OUT="$("$APKSIGNER" verify --print-certs "$APK" 2>&1)"
S1=$(echo "$OUT" | sed -n 's/.*SHA-1 digest: //p' | tr -d '\r')
S256=$(echo "$OUT" | sed -n 's/.*SHA-256 digest: //p' | tr -d '\r')
echo "Paste these into Firebase → Project settings → Your Android app → Add fingerprint:"
echo ""
echo "SHA-1"
hex_to_colon "$S1"
echo ""
echo "SHA-256"
hex_to_colon "$S256"
echo ""
