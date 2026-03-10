const js = require("@eslint/js")
const reactPlugin = require("eslint-plugin-react")
const globals = require("globals")

/**
 * @param {Record<string, boolean | "readonly" | "writable" | "off">} input
 * @returns {Record<string, boolean | "readonly" | "writable" | "off">}
 */
function sanitizeGlobals(input) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key.trim(), value])
  )
}

module.exports = [
  {
    ignores: ["build"]
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: {
      react: reactPlugin
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...sanitizeGlobals(globals.browser),
        ...sanitizeGlobals(globals.node)
      }
    },
    rules: {
      "eqeqeq": "off",
      "no-return-assign": "off",
      "no-unused-vars": ["error", {varsIgnorePattern: "^React$"}],
      "react/jsx-uses-vars": "error"
    }
  }
]
