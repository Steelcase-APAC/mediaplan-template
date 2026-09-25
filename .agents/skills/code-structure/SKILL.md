---
name: code-structure
description: Architecture guide for structuring code into actions (orchestration/UI) and reusable services (business logic/calculations). Use when adding features, refactoring duplicated blocks, or preventing god-functions.
---

# Service Layer Architecture

## Separation of Concerns

```
Actions / UI Layer (Orchestration)       Service Layer (Reusable Mechanics)
├── Owns DOM event listeners            ├── Owns pure calculation functions
├── Owns modal open/close states        ├── Owns data normalization & schemas
├── Owns user notification & alerts     ├── Owns serialization (CSV, JSON)
└── Calls service functions             └── Returns structured, predictable results
```

## Principles
1. **Composable Capability Blocks**: Keep functions focused. Avoid 500-line monolithic handler functions.
2. **Explicit Inputs & Structured Returns**: Prefer pure functions taking explicit data and returning calculated values rather than relying on hidden global side effects.
3. **Single Source of Truth**: Calculation formulas must live in one central function rather than being re-implemented across multiple UI click handlers.
4. **Resilient Defaults**: Always guard against missing properties (`(channel.months && channel.months[m]) || 0`).
