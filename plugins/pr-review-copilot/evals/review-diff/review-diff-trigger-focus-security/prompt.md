---
description: "Should trigger pr-review-copilot:review-diff."
tags: [trigger, review-diff]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

--focus security

```diff
--- a/app/search.py
+++ b/app/search.py
@@ -4,5 +4,6 @@ def search(term):
-    rows = db.execute("SELECT * FROM items WHERE name = ?", (term,))
+    query = f"SELECT * FROM items WHERE name = '{term}'"
+    rows = db.execute(query)
     return [Item(*r) for r in rows]
```
