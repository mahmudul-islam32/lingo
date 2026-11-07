# Contract requests

Devs and the pm never edit `/src/contracts`. If you need a contract change, **stop**
and add an entry below (newest first). The cto answers in the same entry, makes the
change on a `chore/` branch and lists every affected feature.

Status values: `open` · `approved` · `rejected` · `done`.

## Template

Copy this block, fill it in, and put it under "Requests".

```md
### CR-NNN: <short title>

- **Requested by:** <agent> · **Date:** YYYY-MM-DD · **Ticket:** <TICKET-ID>
- **Status:** open
- **Contract(s):** e.g. `src/contracts/course.ts` → `ListenExerciseSchema`
- **Problem:** what you can't do with the current contract
- **Proposed change:** fields/types to add, remove or change (with an example)
- **Breaking?:** yes/no (does it change persisted or synced data or existing content?)

**CTO decision:** (cto fills in) approved/rejected, reasoning, final shape, affected
features, follow-up PR
```

## Requests

_None yet._
