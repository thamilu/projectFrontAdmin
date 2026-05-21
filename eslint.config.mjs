import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        {
          type: "domain",
          pattern: "domain/**/*",
        },
        {
          type: "core",
          pattern: "core/**/*",
        },
        {
          type: "infrastructure",
          pattern: "infrastructure/**/*",
        },
        {
          type: "shared",
          pattern: "shared/**/*",
        },
        {
          type: "feature",
          pattern: "features/admin/([^/]+)/**/*",
          capture: ["featureName"],
        },
        {
          type: "app",
          pattern: "app/**/*",
        },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            // 1. Domain Layer is completely pure. It cannot import anything outside the domain itself.
            {
              from: { type: "domain" },
              allow: [{ to: { type: "domain" } }],
            },
            // 2. Core layer can only import from domain or core.
            {
              from: { type: "core" },
              allow: [
                { to: { type: "domain" } },
                { to: { type: "core" } }
              ],
            },
            // 3. Infrastructure layer can import from domain, core, and infrastructure.
            {
              from: { type: "infrastructure" },
              allow: [
                { to: { type: "domain" } },
                { to: { type: "core" } },
                { to: { type: "infrastructure" } }
              ],
            },
            // 4. Shared layer can import from domain and shared. It must NOT import core, infrastructure, or features.
            {
              from: { type: "shared" },
              allow: [
                { to: { type: "domain" } },
                { to: { type: "shared" } }
              ],
            },
            // 5. Feature layers can import from domain, core, infrastructure, shared.
            // Crucially, features can ONLY import from their own feature subfolder. Cross-feature imports are prohibited.
            {
              from: { type: "feature" },
              allow: [
                { to: { type: "domain" } },
                { to: { type: "core" } },
                { to: { type: "infrastructure" } },
                { to: { type: "shared" } },
                {
                  to: {
                    type: "feature",
                    captured: {
                      featureName: "{{from.captured.featureName}}"
                    }
                  }
                }
              ],
            },
            // 6. App layer can import from any layer to compose the final application.
            {
              from: { type: "app" },
              allow: [
                { to: { type: "domain" } },
                { to: { type: "core" } },
                { to: { type: "infrastructure" } },
                { to: { type: "shared" } },
                { to: { type: "feature" } },
                { to: { type: "app" } }
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["domain/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message: "Domain entities must remain pure; importing React is forbidden."
            },
            {
              name: "lucide-react",
              message: "Domain entities must remain pure; importing UI icons is forbidden."
            }
          ]
        }
      ]
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
