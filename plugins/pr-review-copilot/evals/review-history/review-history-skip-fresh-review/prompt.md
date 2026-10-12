---
description: "Near-miss for pr-review-copilot:review-history. A fresh review is review-diff; history is consulted after, not instead."
tags: [near-miss, review-history]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Review this diff:

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
