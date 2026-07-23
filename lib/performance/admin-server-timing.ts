import "server-only";

const enabled =
  process.env.ADMIN_PERF_DEBUG === "1";

export async function measureAdminServerStep<T>(
  label: string,
  operation: () => Promise<T>
): Promise<T> {
  if (!enabled) {
    return operation();
  }

  const startedAt =
    performance.now();

  try {
    const result =
      await operation();

    console.info(
      "[ADMIN_PERF]",
      JSON.stringify({
        label,
        durationMs:
          Math.round(
            (performance.now() - startedAt) * 10
          ) / 10,
        status: "ok",
      })
    );

    return result;
  } catch (error) {
    console.error(
      "[ADMIN_PERF]",
      JSON.stringify({
        label,
        durationMs:
          Math.round(
            (performance.now() - startedAt) * 10
          ) / 10,
        status: "error",
      })
    );

    throw error;
  }
}
