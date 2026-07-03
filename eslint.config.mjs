import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      /*
       * React 19.2 prijavljuje sinhroni setState unutar efekata kao
       * performance problem. Projekat trenutno ima više postojećih obrazaca
       * za hidrataciju localStorage vrednosti i sinhronizaciju admin formi sa
       * izabranim zapisom.
       *
       * Pravilo privremeno ostaje uključeno kao upozorenje, umesto kao error,
       * kako bismo mogli bezbedno da refaktorišemo svaki obrazac pojedinačno
       * bez blokiranja lint/build provere.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
