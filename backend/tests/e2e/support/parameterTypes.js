import { defineParameterType } from "@cucumber/cucumber";

defineParameterType({
  name: "actor",
  regexp: /[A-Za-z][A-Za-z0-9_-]*/,
  transformer: (value) => value,
});
