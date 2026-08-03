# ADT Change Specifications

Use this file before significant implementation or documentation changes.

## Template

```markdown
## SPEC-ADT-XXX - Title

**Date:**
**Status:** Draft / In progress / Done / Cancelled

### Goal

### Why

### Constraints

### Acceptance Criteria

### Affected Files

### Expected Result

### Verification
```

## Register

| ID | Title | Status | Related Files |
| --- | --- | --- | --- |
| SPEC-ADT-001 | Sync documentation with Project Framework | Done | `docs/WIKI_INDEX.md`, `docs/DOCUMENT_REGISTRY.md`, `docs/AGENT_CONTEXT.md`, `docs/DECISIONS.md`, `docs/HYPOTHESES.md`, `docs/EXPERIMENTS.md`, `docs/RELEASES.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/CHANGE_SPECIFICATIONS.md` |

## SPEC-ADT-001 - Sync Documentation With Project Framework

**Date:** 2026-08-03
**Status:** Done

### Goal

Bring current ADT documentation into the Project Framework structure.

### Why

ADT has working test logs and process notes, but needs the standard entrypoints: wiki index, document registry, agent context, decisions, hypotheses, experiments, releases, roadmap, architecture, and change specifications.

### Constraints

- Do not change the website behavior.
- Do not rewrite factual test results.
- Preserve Test 006 as the current behavior baseline.
- Keep pricing flexibility parked, not active.

### Acceptance Criteria

- Framework entrypoint exists.
- All current docs are listed in the document registry.
- Agent Context captures the current baseline and working rules.
- Test 006 is reflected in status, hypotheses, experiments, and roadmap.

### Affected Files

See the register row for `SPEC-ADT-001`.

### Expected Result

The next AI session can start from `docs/WIKI_INDEX.md` and understand the project without reconstructing context from chat history.

### Verification

Documentation-only review plus `rg` checks for current baseline and Test 006 references.
