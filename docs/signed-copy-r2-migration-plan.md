# Signed Copy Legacy URL Migration Plan (Manual, Not Auto-Executed)

## Scope
Migrate legacy `contract_document.signed_copy_url` records to private Cloudflare R2 object storage and persist `signed_copy_object_key`.

## Important Constraints
- Do not run automatically during deploy.
- Do not fetch arbitrary external URLs without explicit operator approval.
- Do not overwrite records that already have `signed_copy_object_key`.
- Preserve `signed_copy_url` as legacy fallback until migration is fully validated.

## Proposed Manual Workflow
1. Export candidate records where:
   - `signed_copy_url IS NOT NULL`
   - `signed_copy_object_key IS NULL`
2. Review and approve source URL host allowlist before any download.
3. For each approved record:
   - Download the legacy file using a controlled script.
   - Validate content type and size policy.
   - Upload to private R2 bucket under generated object key.
   - Verify uploaded metadata from R2.
   - Update `signed_copy_object_key` for the specific `contract_document.id`.
4. Log success/failure per record and keep retry queue for failures.
5. After validation window, optionally deprecate legacy `signed_copy_url` serving path.

## Rollback
- Keep `signed_copy_url` unchanged during migration.
- If R2 association fails for a record, leave legacy URL untouched and mark for manual retry.
