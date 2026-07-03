import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const nextConfig = [
  ...nextVitals,
  ...nextTs,
].map((config) => {
  if (
    config.rules &&
    "react-hooks/set-state-in-effect" in config.rules
  ) {
    return {
      ...config,
      rules: {
        ...config.rules,

        /*
         * React 19.2 prijavljuje sinhroni setState unutar efekata kao
         * performance problem.
         *
         * Pravilo privremeno ostaje uključeno kao upozorenje, umesto kao
         * error, dok postojeće obrasce refaktorišemo pojedinačno.
         */
        "react-hooks/set-state-in-effect": "warn",
      },
    };
  }

  return config;
});

const eslintConfig = defineConfig([
  ...nextConfig,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;