"use client";

import Link from "next/link";

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  unstable_retry: () => void;
};

export default function GlobalError({
  error,
  unstable_retry,
}: GlobalErrorProps) {
  return (
    <html lang="sr-Latn" dir="ltr">
      <head>
        <title>Sistemska greška | Salon Platforma</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#09090b",
          color: "#f4f4f5",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <main
          role="alert"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 20px",
            boxSizing: "border-box",
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: 560,
              border: "1px solid #27272a",
              borderRadius: 24,
              background: "#18181b",
              padding: 32,
              boxSizing: "border-box",
              boxShadow:
                "0 24px 70px rgba(0,0,0,.35)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#fcd34d",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".18em",
                textTransform: "uppercase",
              }}
            >
              Sistemska greška
            </p>

            <h1
              style={{
                margin: "16px 0 0",
                color: "#ffffff",
                fontSize: 30,
                lineHeight: 1.2,
              }}
            >
              Platforma nije uspela da se učita
            </h1>

            <p
              style={{
                margin: "16px 0 0",
                color: "#a1a1aa",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              Došlo je do problema u osnovnom sloju aplikacije. Pokušaj ponovo, a ako se problem ponavlja vrati se na početnu stranicu.
            </p>

            {error.digest ? (
              <p
                style={{
                  margin: "18px 0 0",
                  color: "#71717a",
                  fontSize: 12,
                  lineHeight: 1.6,
                  wordBreak: "break-all",
                }}
              >
                Referenca greške: {error.digest}
              </p>
            ) : null}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 28,
              }}
            >
              <button
                type="button"
                onClick={unstable_retry}
                style={{
                  border: 0,
                  borderRadius: 12,
                  background: "#ffffff",
                  color: "#09090b",
                  padding: "12px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Pokušaj ponovo
              </button>

              <Link
                href="/"
                style={{
                  border: "1px solid #3f3f46",
                  borderRadius: 12,
                  color: "#e4e4e7",
                  padding: "11px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Početna stranica
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
