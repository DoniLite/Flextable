---
title: Introduction
description: What FlexTable is, how the packages fit together, and where to go next.
---

FlexTable is a data-table library split into a framework-agnostic core and a pair of thin,
idiomatic bindings — one for React, one for Vue. It exists so that sorting, filtering, pagination
math, error handling and the column model itself are written and tested **once**, while the parts
that genuinely differ between frameworks (components, hooks vs. composables, render layers) stay
small and framework-native.

## The shape of the library

```
@flextable/core          framework-agnostic classes, types, helpers
    ├─ @flextable/react       FlexTable.tsx, hooks, toReactColumnDef()
    │    └─ @flextable/react-ui    default Radix-based primitives (optional)
    │    └─ @flextable/react-crud  entity editor + async store glue (optional)
    └─ @flextable/vue         FlexTable.vue, composables, toVueColumnDef()
         └─ @flextable/vue-ui     default reka-ui-based primitives (optional)
         └─ @flextable/vue-crud   server pagination/filter handlers (optional)
```

`@flextable/core` has no dependency on React, Vue, an i18n library, a toast library, or any
particular backend error shape. Everything framework- or app-specific is **injected**:

- a `TranslateFn` (`(key, options?) => string`) instead of importing `react-i18next` or `vue-i18n`,
- a `NotifyFn` (in the CRUD packages) instead of importing `sonner`,
- an `ErrorCodeAdapter<TCode>` instead of assuming a specific backend's error-code enum,
- UI primitives passed as a `components` override instead of being hardcoded.

## The column model

Instead of hand-writing `ColumnDef` objects per framework, you describe columns once through a
`ColumnFactory` instance, which returns framework-agnostic `ColumnConfig` descriptors. Each
binding package then translates those descriptors into real `ColumnDef`s via `toReactColumnDef()`
or `toVueColumnDef()`. See [ColumnFactory & column kinds](/guides/column-factory/) for the full
picture, including the `registerColumnType()` extension point for column kinds the built-ins don't
cover.

## Where to go next

- [Getting started — React](/guides/getting-started-react/)
- [Getting started — Vue](/guides/getting-started-vue/)
- [Live demo](/guides/live-demo/) — the same dataset rendered with both bindings side by side
- [API reference](/api/core/) — generated from source for all seven packages
