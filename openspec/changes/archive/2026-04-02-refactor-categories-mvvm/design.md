## Context

We analyzed `CategoryGrid.tsx` and observed heavy coupling: filtering variables, active categories to be deleted, deletion state flags, and UI components all exist in a single block. Migrating this requires strict adherence to `useCategoriesModel` that parses logic cleanly down to `<CategoriesView />`.

## Goals / Non-Goals

**Goals:**
- Decompose the monolith `CategoryGrid.tsx`.
- Move the file to match the directory standard: `src/pages/categories/`.
- Isolate delete API calls to the ViewModel hook ensuring the UI exclusively dispatches explicit action handlers payload-first.

**Non-Goals:**
- Creating new `financeApi` layers for tags or deep integrations.

## Decisions

- **Modals Logic**: Unlike traditional forms, Modals for creating and editing categories will be passed the states tracked entirely inside `categories.model.ts` and triggered smoothly from the View bindings.

## Risks / Trade-offs

- **Risk**: Deleting `CategoryGrid.tsx` necessitates routing updates in `App.tsx`, potentially breaking navigation.
- *Mitigation*: We will strictly test UI transitions and update `App.tsx` routing.
