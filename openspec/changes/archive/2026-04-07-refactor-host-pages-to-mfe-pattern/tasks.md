## 1. Migrate FinanceRemote (simplest page)

- [ ] 1.1 Create `src/pages/finance-remote/` directory with `finance-remote.type.ts` (props interface, model output type)
- [ ] 1.2 Create `finance-remote.model.ts` with `useFinanceRemoteModel` hook (lazy import logic)
- [ ] 1.3 Create `finance-remote.view.tsx` with `FinanceRemoteView` (Suspense + lazy component render)
- [ ] 1.4 Create `page.tsx` orchestrating model → view, with named + default exports

## 2. Migrate Dashboard

- [ ] 2.1 Create `src/pages/dashboard/` directory with `dashboard.type.ts`
- [ ] 2.2 Create `dashboard.model.ts` with `useDashboardModel` hook (navigate action)
- [ ] 2.3 Create `dashboard.view.tsx` with `DashboardView` (Header + Card + reload button)
- [ ] 2.4 Create `page.tsx` orchestrating model → view

## 3. Migrate Landing

- [ ] 3.1 Create `src/pages/landing/` directory with `landing.type.ts`
- [ ] 3.2 Create `landing.model.ts` with `useLandingModel` hook (minimal — static page)
- [ ] 3.3 Create `landing.view.tsx` with `LandingView` (hero, features, tech stack, CTAs, footer)
- [ ] 3.4 Create `page.tsx` orchestrating model → view

## 4. Migrate Login

- [ ] 4.1 Create `src/pages/login/` directory with `login.type.ts`
- [ ] 4.2 Create `login.schema.ts` with Zod schema (email, password) and `FormValues` type
- [ ] 4.3 Create `login.model.ts` with `useLoginModel` hook (useForm, useAuth, navigate, submit handler, loading state)
- [ ] 4.4 Create `login.view.tsx` with `LoginView` (form fields, submit button, register link)
- [ ] 4.5 Create `page.tsx` orchestrating model → view

## 5. Migrate Register

- [ ] 5.1 Create `src/pages/register/` directory with `register.type.ts`
- [ ] 5.2 Create `register.schema.ts` with Zod schema (name, email, password) and `FormValues` type
- [ ] 5.3 Create `register.model.ts` with `useRegisterModel` hook (useForm, useAuth, navigate, submit handler, loading state)
- [ ] 5.4 Create `register.view.tsx` with `RegisterView` (form fields, submit button, login link)
- [ ] 5.5 Create `page.tsx` orchestrating model → view

## 6. Migrate Settings (most complex page)

- [ ] 6.1 Create `src/pages/settings/` directory with `settings.type.ts` (ApiKey interface, modal states, model output)
- [ ] 6.2 Create `settings.schema.ts` with Zod schema for API key creation form
- [ ] 6.3 Create `settings.model.ts` with `useSettingsModel` hook (API key CRUD, modals, clipboard, loading states)
- [ ] 6.4 Create `settings.view.tsx` with `SettingsView` (key list, create dialog, created key dialog, revoke actions)
- [ ] 6.5 Create `page.tsx` orchestrating model → view

## 7. Update Routes and Cleanup

- [ ] 7.1 Update `App.tsx` to import all pages from `./pages/<feature>/page` instead of `./pages/<PascalCaseName>`
- [ ] 7.2 Delete original single-file pages: `Dashboard.tsx`, `FinanceRemote.tsx`, `Landing.tsx`, `Login.tsx`, `Register.tsx`, `Settings.tsx`

## 8. Verification

- [ ] 8.1 Run `pnpm check-types` to verify no TypeScript errors
- [ ] 8.2 Run `pnpm lint` to verify no lint errors in host app
- [ ] 8.3 Run `pnpm build` to verify the host app builds successfully
- [ ] 8.4 Run `pnpm dev:frontend` and manually verify all routes render correctly (landing, login, register, dashboard, finance, settings)
