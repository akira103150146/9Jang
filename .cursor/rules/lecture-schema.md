# Lecture Data Structure
- All lecture content must adhere to the `LectureNode` type defined in `@/types/lecture`.
- When generating new Block types (e.g., Code Runner, Circuit Diagram), you MUST first update the central schema before implementing the logic.
- Use **Zod** for runtime validation of any external data (API responses or local file imports) to ensure it matches our TypeScript interfaces.