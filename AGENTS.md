# Agent Instructions

## Response Style

- Keep responses concise and to the point.
- Explain why when introducing a new tool, pattern, command, or design choice.
- Prefer practical guidance over long theory.
- Do not overwhelm with many options unless a decision genuinely matters.

## Working With The User

- The user wants to implement the project themselves.
- Guide instead of taking over implementation unless explicitly asked.
- When the user asks for code, provide small, focused snippets and explain where they belong.
- When reviewing user code, point out the important issue first, then suggest the smallest useful correction.

## Questions And Decisions

- If many decisions/questions need the user's input, write them into `QnA.md` instead of asking one-by-one in chat.
- Use `QnA.md` as a running decision log:
  - question
  - recommended answer
  - user's answer
  - final decision
- Keep `QnA.md` readable and grouped by topic.

## Project Context

- This is a local read-only File Explorer app.
- Frontend: Vite React.
- Backend: Node.js with Express.
- The app should be keyboard-first, not keyboard-only.
- Important keyboard actions should also have UI controls.
- The user prefers understanding the reason behind each design choice.
