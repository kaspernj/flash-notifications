module.exports = {
  root: true,
  extends: ['universe/native', 'universe/web'],
  ignorePatterns: ['build'],
  rules: {
    "eqeqeq": "off",
    "no-return-assign": "off",
    "prettier/prettier": "off",
    "react-hooks/rules-of-hooks": "off",
    "import/order": "off"
  }
}
