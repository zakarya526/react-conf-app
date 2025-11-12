const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo");
const reactCompiler = require("eslint-plugin-react-compiler");
const reactNativePlugin = require("eslint-plugin-react-native");

module.exports = defineConfig([
  expoConfig,
  reactCompiler.configs.recommended,
  {
    plugins: {
      "react-native": reactNativePlugin,
    },
    rules: {
      "comma-dangle": ["error", "always-multiline"],
      "react-native/split-platform-components": "error",
      "react-native/no-inline-styles": "error",
      "react-native/sort-styles": "error",
    },
    settings: {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
]);