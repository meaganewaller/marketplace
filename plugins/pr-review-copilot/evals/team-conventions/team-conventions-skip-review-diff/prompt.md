---
description: "Near-miss for pr-review-copilot:team-conventions. Reviewing a diff is review-diff even when conventions are mentioned."
tags: [near-miss, team-conventions]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Review this diff against our conventions:

```diff
--- a/src/orders.ts
+++ b/src/orders.ts
@@ -12,7 +12,7 @@ export async function totalFor(userId: string) {
   const orders = await db.orders.findMany({ where: { userId } });
-  if (!orders) return 0;
-  return orders.reduce((sum, o) => sum + o.amount, 0);
+  return orders.reduce((sum, o) => sum + o.amount);
 }
```
