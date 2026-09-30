---
applyTo: "**"
---

When you need to ask the user one or more questions, always use the `vscode/askQuestions` tool if it is available. Only fall back to plain text questions if the tool is not available in your current context.

Before asking, check whether the answer already exists in the PRD, the approved plan, `.github/skills/frontend/references/architecture.md`, or `docs/`. Do not ask for something that is already written down.

**Question Types:**
- **Structured options**: Use when there are 2–5 clear choices (e.g., "yes/no", "choice A/B/C"). Pass `options` array.
- **Free text input**: Use when you need open-ended user input (e.g., page name, content owner, custom value). Omit `options` or set `allowFreeformInput: true`.
- **Mixed**: Combine both — provide quick-pick options AND allow free text entry. Set `allowFreeformInput: true` even with `options`.

Always mark the recommended option with `"recommended": true` to guide the user.
