#!/usr/bin/env bash
set -euo pipefail
if [ $# -ne 1 ]; then
  echo "Usage : $0 <chemin_vers_archive.tar.gz>"
  exit 1
fi
ARCHIVE="$1"
RESTORE_DIR="${HOME}/restauration-$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "${RESTORE_DIR}"
echo "→ Restauration vers : ${RESTORE_DIR}"
tar -xzf "${ARCHIVE}" -C "${RESTORE_DIR}"
echo "✅ Restauré dans : ${RESTORE_DIR}"