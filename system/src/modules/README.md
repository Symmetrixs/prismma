# Adding a new module

Every module in this system lives entirely in its own folder here, under `modules/{slug}/`. Nothing about a module lives anywhere else in the codebase.

## How it works

1. Create a new folder, `modules/your-module-slug/`, with an `index.tsx` that exports the module's screen as its default export.
2. Register it in `registry.ts`, mapping the slug to a lazy import of that folder.
3. Register the module in the database, from Admin Operations → Modules, so it has a name, description, and a status. New modules start as "Coming Soon" until they're ready.
4. Once the module is ready for people to actually use, flip its status to "Active" from that same screen. That's what makes it requestable and visible on the dashboard.

## Access

Most modules require a user to request access and get approved, the same flow News Editor and Ticketing already use. Superadmin automatically has access to every active module without needing to request it. Admin Operations is the one exception, it's gated by role directly rather than by request, since it's not something you'd "request access" to.

## Shared pieces worth reusing

- `components/ConfirmDialog.tsx` for confirmation prompts
- `components/LoadingSpinner.tsx` and `components/EmptyState.tsx` for consistent loading/empty states
- `components/ModuleLogViewer.tsx` plus `core/module_log.py` on the backend, if your module wants its own superadmin-only audit trail, see how Asset Tagging and News Editor use it
- `lib/useEscapeKey.ts` so modals close on Escape, consistently
- The color tokens defined in `index.css` and `tailwind.config.ts` (`bg-surface`, `text-heading`, `text-body`, `text-muted`, `border-border`, `bg-surface-alt`) instead of raw colors like `bg-white` or `text-brand-navy`, so the module works correctly in both light and dark mode automatically
