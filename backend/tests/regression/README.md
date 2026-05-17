# Regression Tests

Place test files in this directory when they are added specifically to cover a bug fix.

## Conventions

- File name: `regression-<issue-id>.test.js` or descriptive name
- First line comment: `// Regression: <issue-id or description>`
- Keep focused: one bug → one test file

## Running

```bash
npm run test:regression
```
