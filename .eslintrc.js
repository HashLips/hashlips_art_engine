module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true
  },
  extends: [
    "standard",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: "latest"
  },
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "double"]
  }
};
