# UI & Component Rules
- Use Functional Components with TypeScript.
- Prioritize using existing components from `@/components/ui` (shadcn/ui).
- For math formulas, always use the `MathBlock` component which wraps KaTeX with `minRuleThickness: 0.06`.
- Logic for "Code Submission" and "English Listening" must be encapsulated in custom hooks (e.g., `useCodeRunner`).