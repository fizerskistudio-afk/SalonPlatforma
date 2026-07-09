import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const pagePath = resolve(
  process.cwd(),
  "app/admin/(protected)/page.tsx"
);

if (!existsSync(pagePath)) {
  throw new Error(
    `TA02_PAGE_NOT_FOUND: nije pronađen fajl ${pagePath}`
  );
}

const original = readFileSync(
  pagePath,
  "utf8"
);

let source = original;

const quickActionsImport =
  'import DashboardBookingQuickActions from "@/components/admin/DashboardBookingQuickActions";';

const pendingBookingsImport =
  'import DashboardPendingBookings from "@/components/admin/DashboardPendingBookings";';

const pendingBookingsDeclaration = `  const pendingBookings = upcomingBookings
    .filter(
      (booking) =>
        booking.status === "pending"
    )
    .slice(0, 5);
`;

const pendingSection = `      <DashboardPendingBookings
        bookings={pendingBookings}
        timezone={business.timezone}
      />

`;

const quickActionsBlock = `

              <DashboardBookingQuickActions
                bookingId={nextBooking.id}
                status={nextBooking.status}
                compact
              />`;

const alreadyComplete =
  source.includes(
    quickActionsImport
  ) &&
  source.includes(
    pendingBookingsImport
  ) &&
  source.includes(
    "const pendingBookings = upcomingBookings"
  ) &&
  source.includes(
    "<DashboardPendingBookings"
  ) &&
  source.includes(
    "<DashboardBookingQuickActions"
  );

if (alreadyComplete) {
  console.log(
    "TENANT-ADMIN-02 je već primenjen."
  );

  process.exit(0);
}

/*
 * 1. Dodavanje import-a.
 */
if (
  !source.includes(
    quickActionsImport
  )
) {
  const bookingsImportPattern =
    /import\s*\{\s*getAdminBookings,[\s\S]*?\}\s*from\s*["']@\/lib\/admin\/bookings["'];/;

  const bookingsImportMatch =
    source.match(
      bookingsImportPattern
    );

  if (
    !bookingsImportMatch ||
    bookingsImportMatch.index ===
      undefined
  ) {
    throw new Error(
      "TA02_IMPORT_ANCHOR_NOT_FOUND: import iz lib/admin/bookings nije pronađen. Fajl nije promenjen."
    );
  }

  const insertAt =
    bookingsImportMatch.index +
    bookingsImportMatch[0].length;

  source =
    source.slice(
      0,
      insertAt
    ) +
    `\n\n${quickActionsImport}\n${pendingBookingsImport}` +
    source.slice(
      insertAt
    );
} else if (
  !source.includes(
    pendingBookingsImport
  )
) {
  source = source.replace(
    quickActionsImport,
    `${quickActionsImport}\n${pendingBookingsImport}`
  );
}

/*
 * 2. Lista budućih rezervacija
 * koje čekaju potvrdu.
 */
if (
  !source.includes(
    "const pendingBookings = upcomingBookings"
  )
) {
  const nextBookingPattern =
    /  const nextBooking\s*=\s*upcomingBookings\[0\]\s*\?\?\s*null;/;

  const nextBookingMatch =
    source.match(
      nextBookingPattern
    );

  if (
    !nextBookingMatch ||
    nextBookingMatch.index ===
      undefined
  ) {
    throw new Error(
      "TA02_NEXT_BOOKING_DECLARATION_NOT_FOUND: nextBooking deklaracija nije pronađena. Fajl nije promenjen."
    );
  }

  const insertAt =
    nextBookingMatch.index +
    nextBookingMatch[0].length;

  source =
    source.slice(
      0,
      insertAt
    ) +
    `\n\n${pendingBookingsDeclaration}` +
    source.slice(
      insertAt
    );
}

/*
 * 3. Sekcija rezervacija na
 * čekanju pre dnevnog rasporeda.
 */
if (
  !source.includes(
    "<DashboardPendingBookings"
  )
) {
  const dailyScheduleMarker =
    source.indexOf(
      "Dnevni raspored"
    );

  if (
    dailyScheduleMarker ===
    -1
  ) {
    throw new Error(
      "TA02_DAILY_SCHEDULE_MARKER_NOT_FOUND: tekst Dnevni raspored nije pronađen. Fajl nije promenjen."
    );
  }

  const dailySectionStart =
    source.lastIndexOf(
      "      <section",
      dailyScheduleMarker
    );

  if (
    dailySectionStart ===
    -1
  ) {
    throw new Error(
      "TA02_DAILY_SECTION_NOT_FOUND: početak sekcije dnevnog rasporeda nije pronađen. Fajl nije promenjen."
    );
  }

  source =
    source.slice(
      0,
      dailySectionStart
    ) +
    pendingSection +
    source.slice(
      dailySectionStart
    );
}

/*
 * 4. Brze akcije ispod linka
 * sledeće rezervacije.
 */
if (
  !source.includes(
    "<DashboardBookingQuickActions"
  )
) {
  const nextBookingLinkMarker =
    source.indexOf(
      "Otvori detalje rezervacije"
    );

  if (
    nextBookingLinkMarker ===
    -1
  ) {
    throw new Error(
      "TA02_NEXT_BOOKING_TEXT_NOT_FOUND: tekst Otvori detalje rezervacije nije pronađen. Fajl nije promenjen."
    );
  }

  const linkStart =
    source.lastIndexOf(
      "<Link",
      nextBookingLinkMarker
    );

  const linkEndStart =
    source.indexOf(
      "</Link>",
      nextBookingLinkMarker
    );

  if (
    linkStart === -1 ||
    linkEndStart === -1
  ) {
    throw new Error(
      "TA02_NEXT_BOOKING_LINK_NOT_FOUND: link sledeće rezervacije nije pronađen. Fajl nije promenjen."
    );
  }

  const linkEnd =
    linkEndStart +
    "</Link>".length;

  source =
    source.slice(
      0,
      linkEnd
    ) +
    quickActionsBlock +
    source.slice(
      linkEnd
    );
}

/*
 * Završna validacija pre upisa.
 */
const requiredMarkers = [
  quickActionsImport,
  pendingBookingsImport,
  "const pendingBookings = upcomingBookings",
  "<DashboardPendingBookings",
  "<DashboardBookingQuickActions",
];

const missingMarkers =
  requiredMarkers.filter(
    (marker) =>
      !source.includes(
        marker
      )
  );

if (
  missingMarkers.length >
  0
) {
  throw new Error(
    `TA02_VALIDATION_FAILED: nedostaju markeri: ${missingMarkers.join(
      ", "
    )}. Fajl nije promenjen.`
  );
}

if (
  source === original
) {
  console.log(
    "TENANT-ADMIN-02 je već primenjen."
  );

  process.exit(0);
}

writeFileSync(
  pagePath,
  source,
  "utf8"
);

console.log(
  "TENANT-ADMIN-02A patch je uspešno primenjen."
);

console.log(
  `Promenjen fajl: ${pagePath}`
);