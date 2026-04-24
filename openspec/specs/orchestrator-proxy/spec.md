## ADDED Requirements

### Requirement: Proxy health service routes

The Orchestrator SHALL forward all authenticated requests matching /health/\* to the health microservice at HEALTH_SERVICE_URL, stripping the /api/health prefix.

#### Scenario: Authenticated request proxied successfully

- **WHEN** an authenticated user sends any HTTP method to /api/health/<path>
- **THEN** orchestrator strips JWT, injects x-user-id header, and forwards the request to HEALTH_SERVICE_URL/<path>

#### Scenario: Unauthenticated request rejected

- **WHEN** a request arrives at /api/health/\* without a valid JWT
- **THEN** orchestrator returns HTTP 401 Unauthorized before forwarding

#### Scenario: Health service unavailable

- **WHEN** HEALTH_SERVICE_URL is unreachable
- **THEN** orchestrator returns HTTP 502 Bad Gateway
