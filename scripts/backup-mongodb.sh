#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${PROJECT_ROOT}/.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Environment file not found: $ENV_FILE" >&2
  exit 1
fi

read_env_value() {
  sed -n "s/^${1}=//p" "$ENV_FILE" | head -n 1
}

MONGODB_URI="${MONGODB_URI:-$(read_env_value MONGODB_URI)}"
BACKUP_DIR="${BACKUP_DIR:-$(read_env_value BACKUP_DIR)}"
RETENTION_DAYS="${RETENTION_DAYS:-$(read_env_value RETENTION_DAYS)}"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/backups/mongodb}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
INCLUDE_OPLOG="${INCLUDE_OPLOG:-$(read_env_value INCLUDE_OPLOG)}"
INCLUDE_OPLOG="${INCLUDE_OPLOG:-NO}"
REMOTE_BACKUP="${REMOTE_BACKUP:-$(read_env_value REMOTE_BACKUP)}"
REMOTE_BACKUP="${REMOTE_BACKUP:-NO}"
S3_BUCKET="${S3_BUCKET:-$(read_env_value S3_BUCKET)}"
S3_PREFIX="${S3_PREFIX:-$(read_env_value S3_PREFIX)}"
AWS_REGION="${AWS_REGION:-$(read_env_value AWS_REGION)}"
AWS_KMS_KEY_ID="${AWS_KMS_KEY_ID:-$(read_env_value AWS_KMS_KEY_ID)}"
S3_PREFIX="${S3_PREFIX:-blog-platform/mongodb}"

if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "MONGODB_URI must be configured in $ENV_FILE" >&2
  exit 1
fi

if ! command -v mongodump >/dev/null 2>&1; then
  echo "mongodump is required. Install the MongoDB Database Tools first." >&2
  exit 1
fi

if [[ "$REMOTE_BACKUP" == "YES" ]]; then
  if ! command -v aws >/dev/null 2>&1; then
    echo "aws CLI is required when REMOTE_BACKUP=YES" >&2
    exit 1
  fi
  if [[ -z "${S3_BUCKET:-}" || -z "${AWS_REGION:-}" || -z "${AWS_KMS_KEY_ID:-}" ]]; then
    echo "S3_BUCKET, AWS_REGION, and AWS_KMS_KEY_ID are required for remote backups" >&2
    exit 1
  fi
fi

if ! [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]] || (( RETENTION_DAYS < 1 )); then
  echo "RETENTION_DAYS must be a positive integer" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="$BACKUP_DIR/blog-platform-${timestamp}.archive.gz"

echo "Creating MongoDB backup: $backup_file"
dump_args=(--uri="$MONGODB_URI" --archive="$backup_file" --gzip)
if [[ "$INCLUDE_OPLOG" == "YES" ]]; then
  dump_args+=(--oplog)
fi
mongodump "${dump_args[@]}"

if [[ "$REMOTE_BACKUP" == "YES" ]]; then
  remote_key="${S3_PREFIX%/}/$(basename "$backup_file")"
  remote_uri="s3://${S3_BUCKET}/${remote_key}"
  echo "Uploading encrypted backup: $remote_uri"
  aws s3 cp "$backup_file" "$remote_uri" \
    --region "$AWS_REGION" \
    --sse aws:kms \
    --sse-kms-key-id "$AWS_KMS_KEY_ID" \
    --only-show-errors
  aws s3api head-object \
    --bucket "$S3_BUCKET" \
    --key "$remote_key" \
    --region "$AWS_REGION" \
      --query '{size:ContentLength, encryption:ServerSideEncryption, key:SSEKMSKeyId}' \
    --output json
fi

find "$BACKUP_DIR" -type f -name 'blog-platform-*.archive.gz' -mtime "+$RETENTION_DAYS" -delete
echo "Backup completed. Backups retained for ${RETENTION_DAYS} days."