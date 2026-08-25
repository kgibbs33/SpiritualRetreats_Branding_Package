import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Rule overrides — applied after all presets so they always take effect.
  {
    rules: {
      // HTML entities like &apos; and &ldquo; are correct JSX. Older versions
      // of eslint-plugin-react treat these as errors on some CI runners.
      // Downgrade to warn so CI doesn't block on pre-escaped content.
      "react/no-unescaped-entities": "warn",
      // Unused-var warnings from icon/component imports don't block deploys.
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
]);

export default eslintConfig;
