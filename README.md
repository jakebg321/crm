
```
crm
├─ AiNotes.txt
├─ components.txt
├─ dbConfg.txt
├─ eslint.config.mjs
├─ next.config.js
├─ overview.txt
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20250506223122_init
│  │  │  └─ migration.sql
│  │  ├─ 20250509194029_add_estimate_creator
│  │  │  └─ migration.sql
│  │  ├─ 20250512203806_make_job_fields_optional
│  │  │  └─ migration.sql
│  │  ├─ 20250513025205_add_notes
│  │  │  └─ migration.sql
│  │  ├─ 20250513202503_add_saved_items_and_templates
│  │  │  └─ migration.sql
│  │  ├─ 20250513203411_add_category_to_saved_items
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ renderDBVALUES.txt
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ register
│  │  │  │  │  └─ RegisterRoute.ts
│  │  │  │  ├─ switch-role
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ [...nextauth]
│  │  │  │     └─ route.ts
│  │  │  ├─ clients
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ employees
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     ├─ jobs
│  │  │  │     │  └─ route.ts
│  │  │  │     └─ route.ts
│  │  │  ├─ estimate-templates
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ estimates
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     ├─ duplicate
│  │  │  │     │  └─ route.ts
│  │  │  │     ├─ email
│  │  │  │     │  └─ route.ts
│  │  │  │     └─ route.ts
│  │  │  ├─ saved-items
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ schedule
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     ├─ notes
│  │  │  │     │  ├─ route.ts
│  │  │  │     │  └─ [noteId]
│  │  │  │     │     └─ route.ts
│  │  │  │     └─ route.ts
│  │  │  └─ settings
│  │  │     └─ estimates
│  │  │        └─ route.ts
│  │  ├─ auth
│  │  │  ├─ error
│  │  │  │  └─ page.tsx
│  │  │  ├─ register
│  │  │  │  └─ page.tsx
│  │  │  └─ signin
│  │  │     └─ page.tsx
│  │  ├─ clients
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ employees
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ error.tsx
│  │  ├─ estimates
│  │  │  ├─ components
│  │  │  │  ├─ AddEstimateDialog.tsx
│  │  │  │  ├─ LineItemForm.tsx
│  │  │  │  └─ SavedItemsDrawer.tsx
│  │  │  ├─ materials
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ settings
│  │  │     └─ page.tsx
│  │  ├─ jobs
│  │  │  ├─ components
│  │  │  │  ├─ AddJobDialog.tsx
│  │  │  │  ├─ JobList.tsx
│  │  │  │  ├─ JobNotes.tsx
│  │  │  │  ├─ JobStats.tsx
│  │  │  │  └─ JobStatusMenu.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ loading.tsx
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ providers.tsx
│  │  ├─ schedule
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  └─ styles
│  │     ├─ theme.ts
│  │     └─ useThemeUpdater.tsx
│  ├─ components
│  │  ├─ ColorSaveManager.tsx
│  │  ├─ DashboardCard.tsx
│  │  ├─ EmployeeSchedule.tsx
│  │  ├─ ErrorBoundary.tsx
│  │  ├─ Layout.tsx
│  │  ├─ Navigation.tsx
│  │  ├─ RoleSwitcher.tsx
│  │  ├─ ThemeColorPalette.tsx
│  │  ├─ ThemeDebugger.tsx
│  │  └─ ThemeDebuggerModal.tsx
│  ├─ lib
│  │  └─ prisma.ts
│  ├─ types
│  │  └─ next-auth.d.ts
│  └─ utils
│     └─ formatters.ts
├─ steps.txt
├─ tracker.txt
└─ tsconfig.json

```