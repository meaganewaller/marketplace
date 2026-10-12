---
description: "Near-miss for debug-session-tracker:debug-session. Mentions a bug but asks for a code review."
tags: [near-miss, debug-session]
plugins: ["../../..", "../../../../pr-review-copilot"]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
---

Here's my fix for the logout bug. Review the diff before I merge:

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
