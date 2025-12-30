# TypeScript Strictness
- NEVER use the `any` type. 
- If a type is unknown, use `unknown` and implement a type guard.
- Avoid using `as` for type casting unless interacting with a 3rd-party library that lacks types.
- Always define explicit return types for functions (except for simple React components).