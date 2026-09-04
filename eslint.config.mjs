import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      "@typescript-eslint/no-explicit-any": ["error", { fixToUnknown: true }],
      "@typescript-eslint/no-restricted-types": [
        "error",
        {
          types: {
            "{}": {
              message:
                "Use a named type, a record, or unknown. Empty object type is not a semantic empty value.",
            },
          },
        },
      ],
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message:
            "Use a const object with defineConstObject and derive the union type. See lib/types/const-object.ts.",
        },
        {
          selector: "TSTypeAssertion",
          message:
            "Angle-bracket type assertions are forbidden. Narrow with type guards or satisfy types.",
        },
      ],
    },
  },
  {
    files: ["**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ["scripts/test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "pnpm-lock.yaml",
  ]),
]);

export default eslintConfig;
