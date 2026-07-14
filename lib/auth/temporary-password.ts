export function isJsonRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function completeTemporaryPasswordMetadata(
  currentMetadata: unknown,
  completedAt: string
): Record<string, unknown> {
  const metadata =
    isJsonRecord(
      currentMetadata
    )
      ? currentMetadata
      : {};

  return {
    ...metadata,
    must_change_password: false,
    credential_completed_at:
      completedAt,
  };
}
