# Test Analysis Report

This document provides an overview of the current state of tests in the `sbn-monorepo` project, including coverage analysis and identified issues.

## Executive Summary

- **Total Applications**: 5
- **Apps with Tests**: 4 (`@sbn/auth`, `@sbn/finance`, `@sbn/orchestrator`, `host`)
- **Apps without Tests**: 1 (`sbn-finance-mfe`)
- **E2E Tests**: Present in `@sbn/auth` and `@sbn/finance` using **Testcontainers** (Postgres/Redis) for isolation.
- **Overall Status**: Most applications have initial unit test setups, but many tests are currently failing due to configuration or dependency injection issues. Coverage is generally low across the board.

## Detailed Analysis by Application

### 1. @sbn/auth (NestJS)
- **Framework**: Jest
- **Status**: ⚠️ Partial Failure
- **Passing Tests**: 2
- **Failing Tests**: 2
- **Coverage**: ~7.86% Statements
- **E2E Tests**: Exist in `test/` folder, use `testcontainers` for DB/Redis.
- **Issues Identified**:
  - `src/auth/auth.service.spec.ts`: Compilation error due to type mismatch (`UserWithoutPassword` missing properties).
  - `src/auth/auth.controller.spec.ts`: Syntax error in `uuid` package (ESM import issue in Jest).

### 2. @sbn/finance (NestJS)
- **Framework**: Jest
- **Status**: ❌ High Failure Rate
- **Passing Tests**: 5
- **Failing Tests**: 7
- **Coverage**: ~21.07% Statements
- **E2E Tests**: Exist in `test/` folder, use `testcontainers` for DB.
- **Issues Identified**:
  - Multiple services (`ProjectionsService`, `RecurrencesService`, `CategoriesService`) fail to initialize in tests because `PrismaService` is not provided in the testing module.
  - "Nest can't resolve dependencies... Please make sure that the argument PrismaService is available in the RootTestModule context."

### 3. @sbn/orchestrator (NestJS)
- **Framework**: Jest
- **Status**: ⚠️ Partial Failure
- **Passing Tests**: 1
- **Failing Tests**: 2
- **Coverage**: ~32.9% Statements
- **Issues Identified**:
  - `ProxyController`: Missing `JwtAuthGuard` provider.
  - `ProxyService`: Missing `HttpService` provider (from `@nestjs/axios`).

### 4. host (React/Vitest)
- **Framework**: Vitest
- **Status**: ✅ Passing
- **Passing Tests**: 4
- **Coverage**: ~8.89% Statements
- **Key Areas Covered**:
  - `src/api/auth.ts`: Auth API utilities.
  - `src/auth/AuthProvider.tsx`: Authentication provider logic.
- **Missing Coverage**: Most UI components, pages, and other API clients are untested.

### 5. sbn-finance-mfe (React/Vitest)
- **Framework**: Vitest (configured in package.json)
- **Status**: ❌ Missing
- **Tests Found**: 0
- **Notes**: The project has a test script (`vitest`), but no test files were found in the source directory.

## Recommendations

1.  **Fix Dependency Injection in NestJS Tests**:
    - Update `*.spec.ts` files to include missing providers (Mocks or actual services).
    - For `PrismaService`, provide a mock implementation to avoid connecting to the database during unit tests.
    - Example for Finance App:
      ```typescript
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CategoriesService,
          { provide: PrismaService, useValue: mockPrismaService }, // Add this
        ],
      }).compile();
      ```

2.  **Resolve ESM Issues in Auth App**:
    - Configure Jest to handle `uuid` correctly (e.g., using `moduleNameMapper` or a custom transformer) or downgrade `uuid` if strictly necessary for CommonJS compatibility.

3.  **Fix Type Errors**:
    - Update `auth.service.spec.ts` to match the expected types in the `login` method.

4.  **Implement Tests for sbn-finance-mfe**:
    - Create initial test setup and add basic smoke tests for components.

5.  **Increase Coverage**:
    - Prioritize adding tests for critical business logic in `finance` and `orchestrator`.
    - Add component tests for `host` and `sbn-finance-mfe` using React Testing Library.
