# Global Engineering Standards

Personal defaults that apply across every project. Lives at `~/.claude/CLAUDE.md`
and loads automatically no matter which repo I'm working in. A project's own
CLAUDE.md (at that repo's root) can add or override specifics — both get read
together, project-level wins on conflicts.

## About me

- 13+ years in software engineering, financial services background (Northwestern
  Mutual, US Bank), now Senior SWE at West Bend Insurance.
- Comfortable with DDD, CQRS, Clean Architecture, microservices — hold code to
  that bar by default.
- Prefer minimal, direct communication. Skip preamble and filler.

## Default stack (fallback only — the project's own CLAUDE.md/README wins)

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: .NET, Clean Architecture (Domain / Application / Infrastructure / API)
- Database: PostgreSQL (Neon)
- Hosting: Railway (backend), Vercel (frontend)

## Workflow

### Plan before building

- For anything beyond a one-line fix, outline the approach first — files touched,
  key decisions, risks — before writing code.
- If the plan stops holding up mid-task, stop and re-plan instead of pushing through.

### Checkpoints, not full autonomy

- Flag and wait for a go-ahead on: new dependencies, schema changes, API contract
  changes, anything architectural.
- Routine stuff — typos, obvious null checks, formatting — just fix it, no need to ask.
- For vague bug reports: form a hypothesis and check it against logs/tests before
  proposing a fix. Don't guess-and-patch.

### Verify before calling it done

- Don't mark something complete without running it (tests, build, or a manual
  check) and showing the result.
- For non-trivial fixes, state briefly what was tested and what wasn't.

## Code standards

- Match the existing style in the file/project before introducing new conventions.
- Explicit over clever — optimize for whoever reads this in six months.
- No dead code, no commented-out blocks, no TODOs without an issue reference.
- New logic gets tests unless told otherwise.

## Git

- Conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, ...).
- Small, reviewable commits over one giant diff.
- Never commit secrets, `.env` files, or credentials — flag it if one is about
  to be added.

## Communication

- Be direct. Skip "Great question!" and similar filler.
- If something asked for is a bad idea, say so and explain why — don't just comply.
- Summaries as bullets, not paragraphs. Show the diff/output, don't narrate it.

## What not to do

- Don't invent library versions, APIs, or config values — check the actual
  file/docs.
- Don't refactor unrelated code while fixing something specific.
- Don't add abstractions "for future flexibility" unless asked for.

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update tasks/lessons.md with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes -- don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests -- then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. Plan First: Write plan to tasks/todo.md with checkable items
2. Verify Plan: Check in before starting implementation
3. Track Progress: Mark items complete as you go
4. Explain Changes: High-level summary at each step
5. Document Results: Add review section to tasks/todo.md
6. Capture Lessons: Update tasks/lessons.md after corrections

## Core Principles

- Simplicity First: Make every change as simple as possible. Impact minimal code.
- No Laziness: Find root causes. No temporary fixes. Senior developer standards.
- Minimal Impact: Only touch what's necessary. No side effects with new bugs.
