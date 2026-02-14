# Test Analysis Report

This document provides an overview of the current state of tests in the `sbn-monorepo` project, including coverage analysis and identified issues.

## Executive Summary

- **Total Applications**: 5
- **Apps with Tests**: 4 (`@sbn/auth`, `@sbn/finance`, `@sbn/orchestrator`, `host`)
- **Apps without Tests**: 1 (`sbn-finance-mfe`)
- **E2E Tests**: Present in `@sbn/auth` and `@sbn/finance` using **Testcontainers** (Postgres/Redis) for isolation.
- **Overall Status**: All unit tests are currently passing across the backend services and host application. Coverage is generally low but stable.

## Detailed Analysis by Application

### 1. @sbn/auth (NestJS)

- **Framework**: Jest
- **Status**: ✅ Passing
- **Passing Tests**: 12
- **Coverage**: ~37.99% Statements
- **E2E Tests**: Exist in `test/` folder, use `testcontainers` for DB/Redis.
- **Improvements Made**:
  - Fixed type mismatch in `auth.service.spec.ts`.
  - Resolved `uuid` ESM import issues by mocking the library in tests.

### 2. @sbn/finance (NestJS)

- **Framework**: Jest
- **Status**: ✅ Passing
- **Passing Tests**: 15
- **Coverage**: ~25.38% Statements
- **E2E Tests**: Exist in `test/` folder, use `testcontainers` for DB.
- **Improvements Made**:
  - Mocked `PrismaService` in all service and controller tests.
  - Fixed transaction creation signature in `transactions.service.spec.ts`.
  - Resolved dependency injection issues in controllers.

### 3. @sbn/orchestrator (NestJS)

- **Framework**: Jest
- **Status**: ✅ Passing
- **Passing Tests**: 3
- **Coverage**: ~34.83% Statements
- **Improvements Made**:
  - Mocked `ProxyService`, `ConfigService`, and `CompositeAuthGuard` in `proxy.controller.spec.ts`.
  - Mocked `HttpService` in `proxy.service.spec.ts`.

### 4. host (React/Vitest)

- **Framework**: Vitest
- **Status**: ✅ Passing
- **Passing Tests**: 4
- **Coverage**: ~8.89% Statements
- **Key Areas Covered**:
  - `src/api/auth.ts`: Auth API utilities.
  - `src/auth/AuthProvider.tsx`: Authentication provider logic.

### 5. sbn-finance-mfe (React/Vitest)

- **Framework**: Vitest (configured in package.json)
- **Status**: ❌ Missing
- **Tests Found**: 0
- **Notes**: The project has a test script (`vitest`), but no test files were found in the source directory.

## Recommendations

1.  **Implement Tests for sbn-finance-mfe**:
    - Create initial test setup and add basic smoke tests for components.

2.  **Increase Coverage**:
    - Prioritize adding tests for critical business logic in `finance` and `orchestrator`.
    - Add component tests for `host` and `sbn-finance-mfe` using React Testing Library.
