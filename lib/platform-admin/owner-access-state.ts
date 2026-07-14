export const OWNER_ACCESS_STATES = [
  "invited",
  "password_pending",
  "active",
  "disabled",
  "recovery_required",
] as const;

export type OwnerAccessState =
  (typeof OWNER_ACCESS_STATES)[number];

export type OwnerAccessStateInput = {
  membershipActive: boolean;
  authUserAvailable: boolean;
  invitedAt: string | null;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  mustChangePassword: boolean;
};

export function resolveOwnerAccessState({
  membershipActive,
  authUserAvailable,
  invitedAt,
  emailConfirmedAt,
  lastSignInAt,
  mustChangePassword,
}: OwnerAccessStateInput): OwnerAccessState {
  if (!membershipActive) {
    return "disabled";
  }

  if (!authUserAvailable) {
    return "recovery_required";
  }

  if (mustChangePassword) {
    return "password_pending";
  }

  if (!emailConfirmedAt) {
    return "invited";
  }

  if (invitedAt && !lastSignInAt) {
    return "password_pending";
  }

  return "active";
}

export function canResendOwnerActivation({
  state,
  hasEmail,
  mustChangePassword,
}: {
  state: OwnerAccessState;
  hasEmail: boolean;
  mustChangePassword: boolean;
}): boolean {
  if (!hasEmail || mustChangePassword) {
    return false;
  }

  return (
    state === "invited" ||
    state === "password_pending"
  );
}
