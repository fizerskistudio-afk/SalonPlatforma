import {
  LoaderCircle,
} from "lucide-react";

export default function ReviewLoading() {
  return (
    <main
      className="flex min-h-[100dvh] items-center justify-center bg-zinc-100 px-6 text-zinc-900"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <LoaderCircle
          className="h-8 w-8 animate-spin text-zinc-700 motion-reduce:animate-none"
          aria-hidden="true"
        />

        <p className="text-sm font-medium text-zinc-600">
          Učitavanje…
        </p>
      </div>
    </main>
  );
}
