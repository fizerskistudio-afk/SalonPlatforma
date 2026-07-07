"use client";

import {
  type ChangeEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  Link2,
  LoaderCircle,
  Unlink,
} from "lucide-react";

import type {
  BusinessMemberEmployeeOption,
  BusinessMemberItem,
} from "@/lib/admin/member-types";

type StaffAccessManagerProps = {
  members: BusinessMemberItem[];
  employees: BusinessMemberEmployeeOption[];
  canManage: boolean;
};

type ApiResponse = {
  ok?: boolean;
  message?: string;
};

const selectClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition hover:border-white/20 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60";

export default function StaffAccessManager({
  members,
  employees,
  canManage,
}: StaffAccessManagerProps) {
  const router = useRouter();

  const staffMembers =
    members.filter(
      (member) =>
        member.role === "staff"
    );

  const [
    pendingMemberId,
    setPendingMemberId,
  ] = useState<string | null>(null);

  const [
    message,
    setMessage,
  ] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function updateLink(
    member: BusinessMemberItem,
    employeeId: string | null
  ) {
    if (!canManage) {
      return;
    }

    setPendingMemberId(member.id);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/admin/staff-links",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            memberId: member.id,
            employeeId,
            expectedUpdatedAt:
              member.updatedAt,
          }),
        }
      );

      const payload =
        (await response.json()) as ApiResponse;

      if (!response.ok || !payload.ok) {
        setMessage({
          type: "error",
          text:
            payload.message ??
            "Veza nije sačuvana.",
        });
        return;
      }

      setMessage({
        type: "success",
        text:
          payload.message ??
          "Staff pristup je povezan.",
      });

      router.refresh();
    } catch (error) {
      console.error(
        "Unable to update staff employee link:",
        error
      );

      setMessage({
        type: "error",
        text:
          "Došlo je do greške pri povezivanju sa serverom.",
      });
    } finally {
      setPendingMemberId(null);
    }
  }

  return (
    <section className="space-y-4 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-300/10 text-violet-200">
            <Link2
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Staff pristup
            </h3>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">
              Svaki staff nalog mora biti povezan sa tačno jednim zaposlenim. Tek tada korisnik vidi sopstveni raspored, rezervacije i zahteve za odsustvo.
            </p>
          </div>
        </div>

        {message && (
          <div
            role="status"
            className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-red-400/20 bg-red-400/10 text-red-200"
            }`}
          >
            {message.type === "success" ? (
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}

            <span>{message.text}</span>
          </div>
        )}

        {staffMembers.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-zinc-600">
            Još nema članova sa staff ulogom.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {staffMembers.map((member) => {
              const pending =
                pendingMemberId === member.id;

              return (
                <article
                  key={member.id}
                  className="grid gap-4 rounded-2xl border border-white/[0.07] bg-black/15 p-4 lg:grid-cols-[1fr_320px_auto] lg:items-end"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-zinc-100">
                      {member.email ??
                        "Email nije dostupan"}
                    </div>

                    <div className="mt-1 text-xs text-zinc-600">
                      {member.employeeName
                        ? `Povezan sa: ${member.employeeName}`
                        : "Nije povezan sa zaposlenim"}
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Zaposleni
                    </span>

                    <select
                      value={member.employeeId ?? ""}
                      disabled={!canManage || pending}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        void updateLink(
                          member,
                          event.target.value || null
                        )
                      }
                      className={selectClassName}
                    >
                      <option value="">
                        — Nije povezano —
                      </option>

                      {employees.map((employee) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                          disabled={!employee.isActive}
                        >
                          {employee.name}
                          {employee.isActive
                            ? ""
                            : " (neaktivan)"}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    disabled={
                      !canManage ||
                      pending ||
                      !member.employeeId
                    }
                    onClick={() =>
                      void updateLink(
                        member,
                        null
                      )
                    }
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {pending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Unlink className="h-4 w-4" />
                    )}

                    Odveži
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {!canManage && (
          <div className="mt-5 rounded-2xl border border-sky-300/15 bg-sky-300/[0.07] px-4 py-3 text-sm text-sky-200">
            Menadžer može da vidi staff veze, ali samo vlasnik može da ih menja.
          </div>
        )}
      </div>
    </section>
  );
}
