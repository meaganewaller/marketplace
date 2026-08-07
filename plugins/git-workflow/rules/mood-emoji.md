# Mood Emoji Reference

Every commit subject line ends with a GitHub emoji that reflects the *content and vibe of this specific change* — not the conventional-commit type label.

## Anti-pattern: don't derive the emoji from the type

`feat` is not always `:sparkles:`. `fix` is not always `:bug:`. `chore` is not always `:broom:`. The emoji describes *this change*, not the type:

- `feat` could be `:relieved:` (finally shipping a long-running effort), `:coffin:` (the new feature replaces a dead subsystem), or `:thinking:` (an exploratory MVP).
- `fix` could be `:tada:` (closes a flaky test that's bitten us for months), `:rage:` (had to dig into vendor code to find it), or `:relieved:` (root cause finally pinned down).
- `chore(deps)` could be `:fire:` (chained bumps shipping fast) or `:nail_care:` (final lockfile polish).

If the emoji is mechanically derivable from the type, you've picked the wrong emoji — re-read the diff and the conversation for the actual mood behind the change (frustration level, excitement, how the ticket went).

## Full palette

| Emoji | Shortcode | Mood |
|-------|-----------|------|
| :sparkles: | `:sparkles:` | excited about something new |
| :tada: | `:tada:` | celebration, milestone |
| :fire: | `:fire:` | on a roll, crushing it |
| :bug: | `:bug:` | squashing something annoying |
| :face_with_spiral_eyes: | `:face_with_spiral_eyes:` | confused, dizzy, "what even is this" |
| :rage: | `:rage:` | frustrated, fighting the tools |
| :relieved: | `:relieved:` | finally fixed, weight off shoulders |
| :broom: | `:broom:` | tidying up, chores |
| :thinking: | `:thinking:` | exploratory, not sure yet |
| :coffin: | `:coffin:` | killing dead code, removing things |
| :rocket: | `:rocket:` | shipping, deploying, launching |
| :nail_care: | `:nail_care:` | polish, aesthetics, making it pretty |

Not limited to this list — any GitHub emoji that fits the moment is fair game.
