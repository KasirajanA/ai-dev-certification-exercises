// CommitGen — Generate git commit messages from staged changes
//
// TODO: Use Claude Code with a CRISP prompt to build this tool!
//
// It should:
// 1. Read `git diff --staged` to see what's changed
// 2. Analyze the diff and generate a Conventional Commit message
//    Format: type(scope): description
//    Types: feat, fix, docs, style, refactor, test, chore
// 3. Display the suggested message
// 4. Optionally commit with that message
//
// Example output:
//   Suggested commit message:
//   feat(auth): add login page with Google OAuth
//
//   [a]ccept / [e]dit / [r]egenerate / [c]ancel?

console.log("CommitGen — use Claude Code to build me!");
console.log("Hint: Write a CRISP prompt covering Context, Requirements,");
console.log("Implementation, Scope, and Perfection criteria.");
