---
description: File a bug card in the backlog from a short description
---

File a bug for: $ARGUMENTS

1. Determine the next BUG number from existing `BUG-*` files across all three `stories/` folders.
2. Create `stories/backlog/BUG-<nnn>-<slug>.md` using the bug template in `stories/README.md`: symptom, found-while, severity, repro steps, expected/actual. Leave root cause/fix empty.
3. If severity is **blocker**, recommend switching to it; otherwise continue current work and note it will be picked via /story ordering.
