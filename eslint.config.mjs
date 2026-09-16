import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** eslint-config-next 16 ships flat configs directly — no FlatCompat needed. */
const config = [
  { ignores: [".next/**", "node_modules/**", "tools/**", "reference-download/**", "docs/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
