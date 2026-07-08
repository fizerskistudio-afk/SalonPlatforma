import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";

import {
  createClient,
} from "@supabase/supabase-js";

function loadSimpleEnvFile(
  filePath
) {
  if (
    !fs.existsSync(
      filePath
    )
  ) {
    return;
  }

  const content =
    fs.readFileSync(
      filePath,
      "utf8"
    );

  for (
    const rawLine of
    content.split(
      /\r?\n/
    )
  ) {
    const line =
      rawLine.trim();

    if (
      !line ||
      line.startsWith(
        "#"
      )
    ) {
      continue;
    }

    const separatorIndex =
      line.indexOf(
        "="
      );

    if (
      separatorIndex <=
      0
    ) {
      continue;
    }

    const key =
      line
        .slice(
          0,
          separatorIndex
        )
        .trim();

    let value =
      line
        .slice(
          separatorIndex +
            1
        )
        .trim();

    if (
      (
        value.startsWith(
          '"'
        ) &&
        value.endsWith(
          '"'
        )
      ) ||
      (
        value.startsWith(
          "'"
        ) &&
        value.endsWith(
          "'"
        )
      )
    ) {
      value =
        value.slice(
          1,
          -1
        );
    }

    if (
      !process.env[
        key
      ]
    ) {
      process.env[
        key
      ] =
        value;
    }
  }
}

loadSimpleEnvFile(
  path.resolve(
    process.cwd(),
    ".env.local"
  )
);

loadSimpleEnvFile(
  path.resolve(
    process.cwd(),
    ".env"
  )
);

const supabaseUrl =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL ??
  process.env
    .SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (
  !supabaseUrl ||
  !serviceRoleKey
) {
  console.error(
    "Nedostaju NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SECRET_KEY u .env.local."
  );

  process.exit(
    1
  );
}

const terminal =
  readline.createInterface({
    input:
      process.stdin,

    output:
      process.stdout,
  });

try {
  const email =
    (
      await terminal.question(
        "Email naloga kome postavljamo lozinku: "
      )
    )
      .trim()
      .toLowerCase();

  const password =
    await terminal.question(
      "Nova lozinka (biće vidljiva u terminalu): "
    );

  if (
    !email ||
    !email.includes(
      "@"
    )
  ) {
    throw new Error(
      "Email nije ispravan."
    );
  }

  if (
    password.length <
    10
  ) {
    throw new Error(
      "Lozinka mora imati najmanje 10 karaktera."
    );
  }

  const supabase =
    createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken:
            false,

          persistSession:
            false,
        },
      }
    );

  let targetUser =
    null;

  const perPage =
    200;

  for (
    let page = 1;
    page <= 25;
    page += 1
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .auth
        .admin
        .listUsers({
          page,
          perPage,
        });

    if (error) {
      throw error;
    }

    targetUser =
      data.users.find(
        (user) =>
          user.email
            ?.trim()
            .toLowerCase() ===
          email
      ) ??
      null;

    if (
      targetUser ||
      data.users.length <
        perPage
    ) {
      break;
    }
  }

  if (
    !targetUser
  ) {
    throw new Error(
      `Auth korisnik ${email} nije pronađen.`
    );
  }

  const {
    error:
      updateError,
  } =
    await supabase
      .auth
      .admin
      .updateUserById(
        targetUser.id,
        {
          password,
        }
      );

  if (
    updateError
  ) {
    throw updateError;
  }

  console.log(
    `Lozinka je uspešno postavljena za ${email}.`
  );
} catch (
  error
) {
  console.error(
    error instanceof
      Error
      ? error.message
      : error
  );

  process.exitCode =
    1;
} finally {
  terminal.close();
}
