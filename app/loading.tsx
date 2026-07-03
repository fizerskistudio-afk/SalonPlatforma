import Image from "next/image";

import {
  SITE_NAME,
} from "@/lib/seo/site";

export default function Loading() {
  return (
    <main
      className="app-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Učitavanje salona"
    >
      <div className="app-loading-glow" />

      <div className="app-loading-content">
        <div className="app-loading-logo-shell">
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={96}
            height={96}
            priority
            className="app-loading-logo"
          />
        </div>

        <p className="app-loading-name">
          {SITE_NAME}
        </p>

        <div
          className="app-loading-dots"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    </main>
  );
}
