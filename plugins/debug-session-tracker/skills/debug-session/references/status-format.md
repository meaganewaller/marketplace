# Status / Recap Rendering Format

Used by both `debug-session` ("/debug status") and `debug-recap` (resuming
or handing off a session).

```markdown
## Debugging: [symptom]
**Session:** [id]  **Status:** [active/resolved/abandoned]
**Started:** [date]  **Last updated:** [date]

### Ruled out
- ~~[claim]~~ -- [evidence, one line]

### Currently testing
- [claim] -- [evidence so far, one line, or "no evidence yet"]

### Untested
- [claim]

### Next steps
- [step]
```

## Worked example

```markdown
## Debugging: Checkout returns 500 intermittently under load
**Session:** checkout-500s-2026-09-17  **Status:** active
**Started:** 2026-09-17 14:20 UTC  **Last updated:** 2026-09-17 15:05 UTC

### Ruled out
- ~~DB connection pool exhausted under load~~ -- Pool metrics show 40/100 connections in use during the spike

### Currently testing
- Retry logic in payment client double-charging and timing out on the second call -- Payment client logs show 2 calls per failed checkout in 3/3 sampled cases

### Untested
- (none logged yet)

### Next steps
- Check if retry logic has a dedup key
- Ask payments team if double-call is expected under timeout
```

## Recap-specific addition

When used by `debug-recap` after a gap (resuming later, or handing off to
someone else), prepend one line above the symptom: how long it's been since
`updated`, e.g. "Picking this back up -- last touched 3 days ago." This
orients the reader before they read the details.
