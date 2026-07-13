import {
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

function readProjectFile(
  relativePath: string
) {
  return readFileSync(
    join(
      process.cwd(),
      relativePath
    ),
    "utf8"
  );
}

describe("platform-admin contrast contract", () => {
  const globalStyles =
    readProjectFile(
      "app/globals.css"
    );
  const platformAdminLayout =
    readProjectFile(
      "app/platform-admin/layout.tsx"
    );

  it("scopes on-light foregrounds to the platform-admin shell", () => {
    expect(
      platformAdminLayout
    ).toContain(
      "platform-admin-shell"
    );
    expect(
      globalStyles
    ).toMatch(
      /\.platform-admin-shell\s+\.bg-white\s*\{[\s\S]*?color:\s*#09090b;/
    );
    expect(
      globalStyles
    ).not.toMatch(
      /\.tenant-public-shell\s+\.bg-white/
    );
  });

  it("gives native platform-admin picker menus a dark readable palette", () => {
    expect(
      globalStyles
    ).toMatch(
      /\.platform-admin-shell\s+select\s*\{[\s\S]*?color-scheme:\s*dark;/
    );
    expect(
      globalStyles
    ).toMatch(
      /\.platform-admin-shell\s+select\s+option,\s*\.platform-admin-shell\s+select\s+optgroup\s*\{[\s\S]*?background-color:\s*#18181b;[\s\S]*?color:\s*#f4f4f5;/
    );
  });
});
