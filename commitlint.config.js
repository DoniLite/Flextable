export default {
  extends: ['@commitlint/config-conventional'],
  // changesets/action commits its "Version Packages" PR with this exact,
  // non-conventional message — allowlist it rather than fight the tool.
  ignores: [(message) => message.startsWith('Version Packages')],
};
