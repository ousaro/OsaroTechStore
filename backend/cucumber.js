export default {
  paths: ["tests/e2e/features/**/*.feature"],
  import: [
    "tests/e2e/support/world.js",
    "tests/e2e/support/parameterTypes.js",
    "tests/e2e/support/hooks.js",
    "tests/e2e/step-definitions/**/*.js",
  ],
  format: [
    "progress",
    "html:tests/coverage/cucumber-report.html",
    "json:tests/coverage/cucumber-report.json",
  ],
  publishQuiet: true,
  parallel: 0,
};
