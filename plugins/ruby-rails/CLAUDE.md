---
description: Ruby 4+ and Rails 8+ development with mise as the default toolchain manager.
globs: "*.rb,*.rake,*.rbs,*.rbi,sig/**/*.rbs,rbi/**/*.rbi,Steepfile,sorbet/config,Gemfile,Gemfile.lock,Rakefile,config/**/*.yml,config/**/*.rb,app/**/*.rb,spec/**/*.rb,test/**/*.rb,.ruby-version,mise.toml,.mise.toml"
alwaysApply: false
---

This plugin's default assumptions — toolchain, Ruby and Rails versions, command
forms, and type-system pairing — live in one place:
[`references/conventions.md`](references/conventions.md). Read it rather than
restating any of it here or in a skill. Every `SKILL.md` points at that same
file, so it is the only place to edit when a default changes.

When a skill from this plugin applies, read its `SKILL.md` and follow it before
improvising Ruby/Rails guidance.
