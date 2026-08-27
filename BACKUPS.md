# MongoDB Backups

The application uses MongoDB for users and posts. Backups must be stored outside
the repository and copied to a separate storage provider before real client
traffic is enabled.

## Prerequisites

- MongoDB Database Tools installed (`mongodump` and `mongorestore`)
- A configured `MONGODB_URI` in `.env`
- A backup destination with restricted access and encryption at rest

## Create a backup

From the project root:

```sh
BACKUP_DIR=/secure/path/blog-backups RETENTION_DAYS=14 ./scripts/backup-mongodb.sh
```

The script creates a timestamped compressed archive and removes local archives
older than `RETENTION_DAYS`. Do not store production archives in this repository.
For a MongoDB replica set, add `INCLUDE_OPLOG=YES` to include oplog data for
point-in-time recovery. Leave it unset for standalone MongoDB deployments.

## Upload to encrypted remote storage

The supported remote target is a private Amazon S3 bucket, or an S3-compatible
service supported by the AWS CLI. Create the bucket with public access blocked,
versioning enabled, and a customer-managed KMS key. Give the backup job only
`s3:PutObject`, `s3:HeadObject`, and `s3:AbortMultipartUpload` permissions for
the backup prefix, plus permission to use the KMS key.

Configure the AWS CLI through its normal credential chain, such as an instance
role, workload identity, or local profile. Never put access keys in `.env`.

Set these values in the runtime environment or `.env`:

```sh
REMOTE_BACKUP=YES
S3_BUCKET=your-private-backup-bucket
S3_PREFIX=blog-platform/mongodb
AWS_REGION=your-aws-region
AWS_KMS_KEY_ID=your-kms-key-id
```

Then run:

```sh
./scripts/backup-mongodb.sh
```

The script uploads with SSE-KMS and verifies the object metadata after upload.
Configure an S3 lifecycle policy to retain daily backups according to the
client's recovery requirements and expire old versions deliberately.

## Restore a backup

Restore only during a planned incident or maintenance window. First stop the
backend so writes cannot happen during the restore:

```sh
CONFIRM_RESTORE=YES ./scripts/restore-mongodb.sh /secure/path/blog-platform-TIMESTAMP.archive.gz
```

The restore uses `--drop`, so it replaces matching collections in the database
from `MONGODB_URI`. Verify the target database name before confirming.

## Operating schedule

- Run backups at least daily in production.
- Keep multiple copies in separate failure domains.
- Monitor backup command exit status and available storage.
- Perform a restore test monthly in a disposable database.
- Record the last successful backup and last successful restore test.

## Recovery targets

Choose and document these with the client before launch:

- **RPO:** maximum acceptable data loss, such as 24 hours.
- **RTO:** maximum acceptable recovery time, such as 2 hours.

The backup interval and retention policy must support those targets.
