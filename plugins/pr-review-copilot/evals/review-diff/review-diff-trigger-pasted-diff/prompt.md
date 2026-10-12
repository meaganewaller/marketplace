---
description: "Should trigger pr-review-copilot:review-diff."
tags: [trigger, review-diff]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

What's wrong with this diff?

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
