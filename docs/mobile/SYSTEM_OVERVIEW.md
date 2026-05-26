# SYSTEM_OVERVIEW.md — Visão Sistêmica para Dev Mobile

> **Audiência:** Desenvolvedor Android que precisa entender a malha de microserviços antes de escrever a primeira linha de Kotlin.

---

## 1. Topologia de Serviços

```
┌─────────────────────────────────────────────────────────────────┐
│                       Android App (Kotlin)                       │
│                   Jetpack Compose + Retrofit                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS · Bearer token / API Key
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│           ORCHESTRATOR  (API Gateway / BFF)  :56080             │
│   • Valida JWT ou API Key                                        │
│   • Injeta header x-user-id antes de fazer proxy                │
│   • Remove headers sensíveis do cliente (x-forwarded-for, etc.) │
│   • Roteia /api/auth/* /api/finance/* /api/health/*             │
└───────┬────────────────────┬──────────────────┬─────────────────┘
        │                    │                  │
        ▼                    ▼                  ▼
┌──────────────┐   ┌────────────────┐  ┌───────────────────┐
│  AUTH :56081 │   │ FINANCE :56082 │  │  HEALTH  :56082+1 │
│  JWT + Redis │   │  Prisma + PG   │  │  Prisma + PG      │
└──────────────┘   └────────────────┘  └───────────────────┘
        │
        ▼
   Redis (sessão)  +  PostgreSQL (usuários / api-keys)
```

**Regra de ouro para o app:** O app Android **nunca fala diretamente** com Auth, Finance ou Health. Toda comunicação passa pelo Orchestrator na porta `:56080` (ou hostname de produção) com o prefixo `/api`.

---

## 2. Estratégia de Autenticação

### 2.1 Tokens e Ciclo de Vida

| Token         | Formato           | TTL     | Onde fica                    |
| ------------- | ----------------- | ------- | ---------------------------- |
| Access Token  | JWT (RS256/HS256) | ~15 min | Memória (ViewModel/State)    |
| Refresh Token | UUID opaco        | 7 dias  | `EncryptedSharedPreferences` |

**Payload do Access Token (decodificado):**

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1714000000,
  "exp": 1714000900
}
```

### 2.2 Armazenamento Seguro (Android)

```kotlin
// Nunca salve tokens em SharedPreferences plain-text
// Use AndroidX Security Crypto

val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val prefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

// Salvar
prefs.edit().putString("refresh_token", token).apply()

// Ler
val refreshToken = prefs.getString("refresh_token", null)
```

> O Access Token **não deve ser persistido em disco**. Mantenha-o apenas em memória (ex.: `StateFlow` ou campo de um `Repository` singleton). Se o app for destruído, o Refresh Token permite restaurar a sessão.

### 2.3 Interceptor de Autenticação (Retrofit + OkHttp)

O interceptor é a peça central do fluxo de token. Ele:

1. Anexa o `Authorization: Bearer <accessToken>` em toda requisição.
2. Detecta resposta `401`.
3. Tenta renovar o token via `/api/auth/refresh`.
4. Repete a requisição original com o novo token.
5. Se o refresh também falhar (`401`), dispara evento de logout forçado.

```kotlin
class AuthInterceptor(
    private val tokenRepository: TokenRepository,
    private val authApiService: AuthApiService // instância SEM este interceptor
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()

        // 1. Adiciona Bearer token
        val accessToken = tokenRepository.getAccessToken()
        val authenticatedRequest = original.newBuilder()
            .header("Authorization", "Bearer $accessToken")
            .build()

        val response = chain.proceed(authenticatedRequest)

        // 2. Token expirado?
        if (response.code != 401) return response

        // 3. Sincroniza refresh (evita race condition)
        synchronized(this) {
            val currentToken = tokenRepository.getAccessToken()

            // Outro coroutine já renovou — re-tenta com token novo
            if (currentToken != accessToken) {
                response.close()
                return chain.proceed(
                    original.newBuilder()
                        .header("Authorization", "Bearer $currentToken")
                        .build()
                )
            }

            // 4. Tenta refresh
            val refreshToken = tokenRepository.getRefreshToken()
                ?: return expireSession(response)

            val refreshResponse = runCatching {
                authApiService.refresh(RefreshRequest(refreshToken)).execute()
            }.getOrNull()

            if (refreshResponse?.isSuccessful == true) {
                val body = refreshResponse.body()!!
                tokenRepository.saveTokens(body.accessToken, body.refreshToken)

                response.close()
                return chain.proceed(
                    original.newBuilder()
                        .header("Authorization", "Bearer ${body.accessToken}")
                        .build()
                )
            }

            return expireSession(response)
        }
    }

    private fun expireSession(response: Response): Response {
        tokenRepository.clearTokens()
        // Emite evento global para a UI navegar para Login
        SessionEventBus.emit(SessionEvent.Expired)
        return response
    }
}
```

```kotlin
// SessionEventBus — singleton para comunicar expiração de sessão para a UI
object SessionEventBus {
    private val _events = MutableSharedFlow<SessionEvent>(extraBufferCapacity = 1)
    val events: SharedFlow<SessionEvent> = _events.asSharedFlow()

    fun emit(event: SessionEvent) { _events.tryEmit(event) }
}

sealed class SessionEvent {
    object Expired : SessionEvent()
}
```

### 2.4 Fluxo Completo de Re-login

```
App inicia
    │
    ├─ refreshToken em disco? ──No──► Tela de Login
    │
   Yes
    │
    ▼
POST /api/auth/refresh { refreshToken }
    │
    ├─ 200 OK ──► Salva novos tokens, navega para Home
    │
    └─ 401 ─────► Limpa tokens, navega para Login com mensagem de sessão expirada
```

### 2.5 Logout

```kotlin
// Sempre invalide o refresh token no servidor antes de limpar localmente
suspend fun logout() {
    val refreshToken = tokenRepository.getRefreshToken()
    runCatching { authApiService.logout(LogoutRequest(refreshToken)) }
    tokenRepository.clearTokens()
}
```

---

## 3. Catálogo de Endpoints

> **Base URL:** `https://<host>/api`  
> **Autenticação:** Todos os endpoints (exceto `/auth/login`, `/auth/register` e `/auth/refresh`) requerem `Authorization: Bearer <accessToken>`.

---

### 3.1 Auth Service — `/api/auth`

#### `POST /api/auth/login`

Autentica o usuário e retorna par de tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response 200:**

```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Victor"
  }
}
```

**Erros:**
| Código | Significado |
|---|---|
| 401 | Credenciais inválidas |
| 400 | Body malformado / campos obrigatórios ausentes |

---

#### `POST /api/auth/register`

Cria nova conta de usuário.

**Request Body:**

```json
{
  "name": "João Victor",
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response 201:**

```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "550e8400-...",
  "user": { "id": "uuid", "email": "...", "name": "..." }
}
```

**Erros:** `400` campo inválido, `409` e-mail já cadastrado.

---

#### `POST /api/auth/refresh`

Renova o par de tokens (token rotation — o refresh antigo é invalidado).

**Request Body:**

```json
{ "refreshToken": "550e8400-..." }
```

**Response 200:**

```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "novo-uuid-..."
}
```

**Erros:** `401` token inválido ou expirado → força logout.

---

#### `POST /api/auth/logout`

Invalida o refresh token no servidor (Redis).

**Request Body:**

```json
{ "refreshToken": "550e8400-..." }
```

**Response 200:** `{ "message": "Logged out" }`

---

#### `GET /api/auth/me` _(requer Bearer token)_

Retorna dados do usuário autenticado.

**Response 200:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "João Victor"
}
```

---

#### `POST /api/auth/api-keys` _(requer Bearer token)_

Cria uma API Key para integrações externas (ex.: MCP server).

**Request Body:**

```json
{
  "name": "Minha Integração",
  "expiresAt": "2027-01-01T00:00:00Z"
}
```

**Response 201:**

```json
{
  "id": "uuid",
  "name": "Minha Integração",
  "key": "sbn_live_abc123...",
  "expiresAt": "2027-01-01T00:00:00Z",
  "createdAt": "2026-04-24T00:00:00Z"
}
```

---

#### `GET /api/auth/api-keys` _(requer Bearer token)_

Lista todas as API Keys do usuário.

**Response 200:** `Array<ApiKeyResponseDto>`

---

#### `DELETE /api/auth/api-keys/:id` _(requer Bearer token)_

Revoga uma API Key.

**Response 200:** `{ "message": "API key revoked" }`

---

### 3.2 Finance Service — `/api/finance`

> Todos os endpoints requerem Bearer token. O Orchestrator injeta `x-user-id` automaticamente; o app não precisa enviar este header.

#### Wallets

| Verbo    | Rota                       | Finalidade                  |
| -------- | -------------------------- | --------------------------- |
| `POST`   | `/api/finance/wallets`     | Criar carteira              |
| `GET`    | `/api/finance/wallets`     | Listar carteiras do usuário |
| `GET`    | `/api/finance/wallets/:id` | Buscar carteira por ID      |
| `PATCH`  | `/api/finance/wallets/:id` | Atualizar carteira          |
| `DELETE` | `/api/finance/wallets/:id` | Excluir carteira            |

**`POST /api/finance/wallets` — Request Body:**

```json
{
  "name": "Nubank",
  "type": "credit_card",
  "balance": 0.0,
  "currency": "BRL",
  "limit": 5000.0,
  "invoiceClosingDay": 20,
  "invoiceDueDay": 27,
  "isActive": true
}
```

**`GET /api/finance/wallets` — Response 200:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Nubank",
    "type": "credit_card",
    "balance": -1200.0,
    "currency": "BRL",
    "isActive": true,
    "invoiceClosingDay": 20,
    "invoiceDueDay": 27,
    "limit": 5000.0,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-04-24T00:00:00Z"
  }
]
```

---

#### Categories

| Verbo    | Rota                          | Finalidade        |
| -------- | ----------------------------- | ----------------- |
| `POST`   | `/api/finance/categories`     | Criar categoria   |
| `GET`    | `/api/finance/categories`     | Listar categorias |
| `GET`    | `/api/finance/categories/:id` | Buscar por ID     |
| `PATCH`  | `/api/finance/categories/:id` | Atualizar         |
| `DELETE` | `/api/finance/categories/:id` | Excluir           |

**`POST /api/finance/categories` — Request Body:**

```json
{
  "name": "Alimentação",
  "color": "#FF5722",
  "icon": "restaurant"
}
```

---

#### Transactions

| Verbo    | Rota                                      | Query Params    | Finalidade                      |
| -------- | ----------------------------------------- | --------------- | ------------------------------- |
| `POST`   | `/api/finance/transactions`               | —               | Criar transação                 |
| `GET`    | `/api/finance/transactions`               | `month`, `year` | Listar com filtro mensal        |
| `GET`    | `/api/finance/transactions/summary`       | `month`, `year` | Resumo (receitas/despesas)      |
| `GET`    | `/api/finance/transactions/:id`           | —               | Buscar por ID                   |
| `PATCH`  | `/api/finance/transactions/:id`           | —               | Atualizar                       |
| `DELETE` | `/api/finance/transactions/:id`           | —               | Excluir                         |
| `POST`   | `/api/finance/transactions/import/nubank` | —               | Importar CSV Nubank (multipart) |

**`POST /api/finance/transactions` — Request Body:**

```json
{
  "walletId": "uuid",
  "categoryId": "uuid",
  "amount": 150.0,
  "date": "2026-04-24",
  "description": "Almoço",
  "type": "Despesa",
  "status": "Pago",
  "isPaid": true,
  "isRecurring": false
}
```

**Enums:**

- `type`: `"Receita"` | `"Despesa"`
- `status`: `"Pendente"` | `"Pago"` | `"Cancelado"`

**`GET /api/finance/transactions/summary?month=4&year=2026` — Response 200:**

```json
{
  "totalIncome": 5000.0,
  "totalExpense": 3200.0,
  "balance": 1800.0
}
```

---

#### Recurrences

| Verbo    | Rota                           | Finalidade                  |
| -------- | ------------------------------ | --------------------------- |
| `POST`   | `/api/finance/recurrences`     | Criar lançamento recorrente |
| `GET`    | `/api/finance/recurrences`     | Listar recorrências         |
| `GET`    | `/api/finance/recurrences/:id` | Buscar por ID               |
| `PATCH`  | `/api/finance/recurrences/:id` | Atualizar                   |
| `DELETE` | `/api/finance/recurrences/:id` | Excluir                     |

**`POST /api/finance/recurrences` — Request Body:**

```json
{
  "walletId": "uuid",
  "categoryId": "uuid",
  "amount": 50.0,
  "description": "Netflix",
  "type": "Despesa",
  "frequency": "monthly",
  "startDate": "2026-01-01",
  "endDate": null
}
```

---

#### Dashboard

| Verbo | Rota                                | Query Params      | Finalidade                     |
| ----- | ----------------------------------- | ----------------- | ------------------------------ |
| `GET` | `/api/finance/dashboard/summary`    | `month`, `year`   | Resumo financeiro mensal       |
| `GET` | `/api/finance/dashboard/categories` | `month`, `year`   | Gasto por categoria            |
| `GET` | `/api/finance/dashboard/year`       | `year` (opcional) | Visão anual (breakdown mensal) |

**`GET /api/finance/dashboard/categories?month=4&year=2026` — Response 200:**

```json
[
  {
    "categoryId": "uuid",
    "categoryName": "Alimentação",
    "color": "#FF5722",
    "total": 850.0,
    "percentage": 26.5
  }
]
```

---

#### Projections

| Verbo | Rota                       | Query Params         | Finalidade                       |
| ----- | -------------------------- | -------------------- | -------------------------------- |
| `GET` | `/api/finance/projections` | `months` (padrão: 6) | Projeção baseada em recorrências |

**Response 200:**

```json
[
  {
    "month": "2026-05",
    "projectedIncome": 5000.0,
    "projectedExpense": 3100.0,
    "projectedBalance": 1900.0
  }
]
```

---

#### Wishlist

| Verbo    | Rota                                            | Query Params         | Finalidade                      |
| -------- | ----------------------------------------------- | -------------------- | ------------------------------- |
| `POST`   | `/api/finance/wishlist`                         | —                    | Criar item                      |
| `GET`    | `/api/finance/wishlist`                         | `status`, `priority` | Listar com filtros              |
| `GET`    | `/api/finance/wishlist/:id`                     | —                    | Buscar por ID                   |
| `PATCH`  | `/api/finance/wishlist/:id`                     | —                    | Atualizar                       |
| `PATCH`  | `/api/finance/wishlist/:id/purchase`            | —                    | Marcar como comprado            |
| `DELETE` | `/api/finance/wishlist/:id`                     | —                    | Excluir                         |
| `POST`   | `/api/finance/wishlist/:id/prices`              | —                    | Adicionar entrada de preço      |
| `GET`    | `/api/finance/wishlist/:id/prices`              | —                    | Histórico de preços             |
| `DELETE` | `/api/finance/wishlist/:id/prices/:entryId`     | —                    | Remover entrada de preço        |
| `POST`   | `/api/finance/wishlist/:id/priorities`          | —                    | Adicionar entrada de prioridade |
| `GET`    | `/api/finance/wishlist/:id/priorities`          | —                    | Histórico de prioridade         |
| `DELETE` | `/api/finance/wishlist/:id/priorities/:entryId` | —                    | Remover entrada de prioridade   |

**`POST /api/finance/wishlist` — Request Body:**

```json
{
  "name": "MacBook Pro M4",
  "targetPrice": 15000.0,
  "priority": "HIGH",
  "status": "WISHLIST",
  "notes": "Para trabalho"
}
```

---

### 3.3 Health Service — `/api/health`

> Todos os endpoints requerem Bearer token.

#### Foods

| Verbo    | Rota                    | Query Params | Finalidade              |
| -------- | ----------------------- | ------------ | ----------------------- |
| `POST`   | `/api/health/foods`     | —            | Cadastrar alimento      |
| `GET`    | `/api/health/foods`     | `search`     | Listar/buscar alimentos |
| `GET`    | `/api/health/foods/:id` | —            | Buscar por ID           |
| `PATCH`  | `/api/health/foods/:id` | —            | Atualizar               |
| `DELETE` | `/api/health/foods/:id` | —            | Excluir                 |

**`POST /api/health/foods` — Request Body:**

```json
{
  "name": "Arroz cozido",
  "brand": null,
  "servingSizeValue": 100,
  "servingSizeUnit": "g",
  "caloriesPerServing": 130,
  "proteinPerServing": 2.5,
  "carbsPerServing": 28.0,
  "fatPerServing": 0.3
}
```

---

#### Goals

| Verbo    | Rota                        | Finalidade             |
| -------- | --------------------------- | ---------------------- |
| `POST`   | `/api/health/goals`         | Criar meta nutricional |
| `GET`    | `/api/health/goals/current` | Buscar meta ativa      |
| `GET`    | `/api/health/goals`         | Listar todas as metas  |
| `PATCH`  | `/api/health/goals/:id`     | Atualizar              |
| `DELETE` | `/api/health/goals/:id`     | Excluir                |

**`POST /api/health/goals` — Request Body:**

```json
{
  "calories": 2000,
  "protein": 150,
  "carbs": 250,
  "fat": 65,
  "water": 2000
}
```

---

#### Meal Logs

| Verbo    | Rota                        | Query Params        | Finalidade              |
| -------- | --------------------------- | ------------------- | ----------------------- |
| `POST`   | `/api/health/meal-logs`     | —                   | Registrar refeição      |
| `GET`    | `/api/health/meal-logs`     | `date` (YYYY-MM-DD) | Listar refeições do dia |
| `DELETE` | `/api/health/meal-logs/:id` | —                   | Excluir registro        |

**`POST /api/health/meal-logs` — Request Body:**

```json
{
  "foodId": "uuid",
  "servings": 1.5,
  "mealType": "lunch",
  "timestamp": "2026-04-24T12:30:00Z"
}
```

---

#### Measurements

| Verbo    | Rota                           | Query Params           | Finalidade                |
| -------- | ------------------------------ | ---------------------- | ------------------------- |
| `POST`   | `/api/health/measurements`     | —                      | Registrar medição de peso |
| `GET`    | `/api/health/measurements`     | `startDate`, `endDate` | Buscar por intervalo      |
| `DELETE` | `/api/health/measurements/:id` | —                      | Excluir                   |

**`POST /api/health/measurements` — Request Body:**

```json
{
  "weight": 82.5,
  "date": "2026-04-24",
  "notes": "Após treino"
}
```

---

#### Water Logs

| Verbo    | Rota                         | Query Params        | Finalidade                 |
| -------- | ---------------------------- | ------------------- | -------------------------- |
| `POST`   | `/api/health/water-logs`     | —                   | Registrar ingestão de água |
| `GET`    | `/api/health/water-logs`     | `date` (YYYY-MM-DD) | Listar do dia              |
| `DELETE` | `/api/health/water-logs/:id` | —                   | Excluir                    |

**`POST /api/health/water-logs` — Request Body:**

```json
{
  "quantity": 300,
  "unit": "ml",
  "timestamp": "2026-04-24T09:00:00Z"
}
```

---

#### Summary

| Verbo | Rota                  | Query Params        | Finalidade                         |
| ----- | --------------------- | ------------------- | ---------------------------------- |
| `GET` | `/api/health/summary` | `date` (YYYY-MM-DD) | Resumo nutricional diário vs metas |

**Response 200:**

```json
{
  "date": "2026-04-24",
  "calories": { "consumed": 1450, "goal": 2000, "remaining": 550 },
  "protein": { "consumed": 110.5, "goal": 150, "remaining": 39.5 },
  "carbs": { "consumed": 180.0, "goal": 250, "remaining": 70.0 },
  "fat": { "consumed": 42.0, "goal": 65, "remaining": 23.0 },
  "water": { "consumed": 1200, "goal": 2000, "remaining": 800 }
}
```

---

## 4. Tratamento de Erros Padrão

O backend retorna erros no formato NestJS padrão:

```json
{
  "statusCode": 400,
  "message": ["campo é obrigatório"],
  "error": "Bad Request"
}
```

| Código HTTP | Causa mais comum                              |
| ----------- | --------------------------------------------- |
| `400`       | Body malformado, campos obrigatórios ausentes |
| `401`       | Token ausente, inválido ou expirado           |
| `403`       | Recurso pertence a outro usuário              |
| `404`       | Entidade não encontrada                       |
| `409`       | Conflito (ex.: e-mail já cadastrado)          |
| `500`       | Erro interno — reportar ao backend            |

---

## 5. Headers Obrigatórios por Requisição

| Header          | Valor                  | Quando                        |
| --------------- | ---------------------- | ----------------------------- |
| `Authorization` | `Bearer <accessToken>` | Todos os endpoints protegidos |
| `Content-Type`  | `application/json`     | Requisições com body JSON     |
| `Content-Type`  | `multipart/form-data`  | Import CSV Nubank             |

> O header `x-user-id` é injetado pelo Orchestrator internamente. O app **nunca** deve enviá-lo.
