#!/usr/bin/env bash
set -euo pipefail
PROJECT_NAME="01-gestion-devis"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${HOME}/sauvegardes/${PROJECT_NAME}"
DATE="$(date +%Y-%m-%d_%H-%M-%S)"
ARCHIVE="${BACKUP_DIR}/${PROJECT_NAME}_${DATE}.tar.gz"
mkdir -p "${BACKUP_DIR}"
echo "→ Sauvegarde vers : ${ARCHIVE}"
tar -czf "${ARCHIVE}" \
  --exclude="node_modules" --exclude=".git" \
  --exclude="dist" --exclude="build" \
  -C "$(dirname "${PROJECT_DIR}")" "$(basename "${PROJECT_DIR}")"
echo "✅ Sauvegarde créée : $(du -h "${ARCHIVE}" | cut -f1)"