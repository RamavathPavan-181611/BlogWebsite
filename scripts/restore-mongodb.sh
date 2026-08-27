#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${PROJECT_ROOT}/.env}"
BACKUP_FILE="${1:-}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Environment file not found: $ENV_FILE" >&2
  exit 1
fi

read_env_value() {
  sed -n "s/^${1}=//p" "$ENV_FILE" | head -n 1
}

MONGODB_URI="${MONGODB_URI:-$(read_env_value MONGODB_URI)}"

if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "MONGODB_URI must be configured in $ENV_FILE" >&2
  exit 1
fi

if ! command -v mongorestore >/dev/null 2>&1; then
  echo "mongorestore is required. Install the MongoDB Database Tools first." >&2
  exit 1
fi

if [[ -z "$BACKUP_FILE" || ! -f "$BACKUP_FILE" ]]; then
  echo "Usage: $0 /path/to/blog-platform-TIMESTAMP.archive.gz" >&2
  exit 1
fi

if [[ "${CONFIRM_RESTORE:-}" != "YES" ]]; then
  echo "Restore replaces data in the database configured by MONGODB_URI." >&2
  echo "Set CONFIRM_RESTORE=YES to continue." >&2
  exit 1
fi

echo "Restoring MongoDB from: $BACKUP_FILE"
mongorestore --uri="$MONGODB_URI" --archive="$BACKUP_FILE" --gzip --drop
echo "Restore completed."