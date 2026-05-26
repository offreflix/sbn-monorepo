# MOBILE_SPEC.md — Especificação de Implementação Android (Kotlin)

> **Stack:** Kotlin · Jetpack Compose · Coroutines/Flow · Retrofit · Hilt · Room · Navigation Compose

---

## 1. Estrutura de Pastas (MVVM + Clean Architecture)

```
app/
└── src/main/
    ├── java/com/sbn/app/
    │
    ├── core/                          # Utilitários transversais
    │   ├── network/
    │   │   ├── AuthInterceptor.kt
    │   │   ├── NetworkModule.kt       # Hilt @Module para Retrofit/OkHttp
    │   │   └── ApiResult.kt          # Sealed class de resultado de rede
    │   ├── session/
    │   │   ├── SessionEventBus.kt
    │   │   └── TokenRepository.kt    # EncryptedSharedPreferences
    │   ├── db/
    │   │   └── AppDatabase.kt        # Room database
    │   └── ui/
    │       ├── components/           # Componentes Compose reutilizáveis
    │       └── theme/
    │           ├── Color.kt
    │           ├── Theme.kt
    │           └── Type.kt
    │
    ├── data/                          # Camada de dados
    │   ├── remote/
    │   │   ├── auth/
    │   │   │   ├── AuthApiService.kt
    │   │   │   └── dto/              # LoginRequest, TokenResponse, etc.
    │   │   ├── finance/
    │   │   │   ├── WalletApiService.kt
    │   │   │   ├── TransactionApiService.kt
    │   │   │   ├── CategoryApiService.kt
    │   │   │   ├── RecurrenceApiService.kt
    │   │   │   ├── WishlistApiService.kt
    │   │   │   ├── DashboardApiService.kt
    │   │   │   └── dto/
    │   │   └── health/
    │   │       ├── FoodApiService.kt
    │   │       ├── MealLogApiService.kt
    │   │       ├── GoalApiService.kt
    │   │       ├── MeasurementApiService.kt
    │   │       ├── WaterLogApiService.kt
    │   │       └── dto/
    │   ├── local/
    │   │   ├── finance/
    │   │   │   ├── WalletDao.kt
    │   │   │   ├── TransactionDao.kt
    │   │   │   └── entity/
    │   │   └── health/
    │   │       ├── MealLogDao.kt
    │   │       └── entity/
    │   └── repository/               # Implementações concretas dos contratos
    │       ├── AuthRepositoryImpl.kt
    │       ├── WalletRepositoryImpl.kt
    │       ├── TransactionRepositoryImpl.kt
    │       └── ...
    │
    ├── domain/                        # Regras de negócio puras (sem Android SDK)
    │   ├── model/                    # Modelos de domínio (≠ DTOs)
    │   │   ├── User.kt
    │   │   ├── Wallet.kt
    │   │   ├── Transaction.kt
    │   │   └── ...
    │   ├── repository/               # Interfaces (contratos)
    │   │   ├── AuthRepository.kt
    │   │   ├── WalletRepository.kt
    │   │   └── ...
    │   └── usecase/
    │       ├── auth/
    │       │   ├── LoginUseCase.kt
    │       │   └── RefreshTokenUseCase.kt
    │       ├── finance/
    │       │   ├── GetTransactionsUseCase.kt
    │       │   ├── CreateTransactionUseCase.kt
    │       │   └── GetDashboardSummaryUseCase.kt
    │       └── health/
    │           ├── LogMealUseCase.kt
    │           └── GetDailySummaryUseCase.kt
    │
    └── ui/                            # Camada de apresentação
        ├── navigation/
        │   ├── AppNavHost.kt
        │   └── NavRoutes.kt
        ├── auth/
        │   ├── login/
        │   │   ├── LoginScreen.kt
        │   │   ├── LoginViewModel.kt
        │   │   └── LoginUiState.kt
        │   └── register/
        ├── finance/
        │   ├── dashboard/
        │   │   ├── DashboardScreen.kt
        │   │   ├── DashboardViewModel.kt
        │   │   └── DashboardUiState.kt
        │   ├── transactions/
        │   ├── wallets/
        │   ├── categories/
        │   ├── recurrences/
        │   ├── wishlist/
        │   └── projections/
        └── health/
            ├── overview/
            ├── meal-log/
            ├── measurements/
            └── water/
```

---

## 2. Módulo de Injeção de Dependência (Hilt)

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor
    ): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    @Provides @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)  // https://api.sbn.app/api/
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

    // Um provide por ApiService
    @Provides @Singleton
    fun provideWalletApiService(retrofit: Retrofit): WalletApiService =
        retrofit.create(WalletApiService::class.java)

    // AuthApiService precisa de um OkHttp SEM o AuthInterceptor (evita loop)
    @Provides @Singleton
    @Qualifier annotation class NoAuthClient
    fun provideNoAuthOkHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

    @Provides @Singleton
    fun provideAuthApiService(@NoAuthClient okHttp: OkHttpClient): AuthApiService =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttp)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApiService::class.java)
}
```

---

## 3. Gerenciamento de Estado — Loading / Success / Error

### 3.1 Sealed Class `UiState`

```kotlin
sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(
        val message: String,
        val code: Int? = null
    ) : UiState<Nothing>()
}
```

### 3.2 Wrapper de Resultado de Rede

```kotlin
sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class HttpError(val code: Int, val message: String) : ApiResult<Nothing>()
    data class NetworkError(val throwable: Throwable) : ApiResult<Nothing>()
}

suspend fun <T> safeApiCall(call: suspend () -> Response<T>): ApiResult<T> {
    return try {
        val response = call()
        if (response.isSuccessful) {
            ApiResult.Success(response.body()!!)
        } else {
            val errorBody = response.errorBody()?.string() ?: "Erro desconhecido"
            ApiResult.HttpError(response.code(), errorBody)
        }
    } catch (e: IOException) {
        ApiResult.NetworkError(e)
    } catch (e: Exception) {
        ApiResult.NetworkError(e)
    }
}
```

### 3.3 ViewModel Padrão

```kotlin
@HiltViewModel
class TransactionsViewModel @Inject constructor(
    private val getTransactionsUseCase: GetTransactionsUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState<List<Transaction>>>(UiState.Idle)
    val uiState: StateFlow<UiState<List<Transaction>>> = _uiState.asStateFlow()

    fun loadTransactions(month: Int, year: Int) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            _uiState.value = when (val result = getTransactionsUseCase(month, year)) {
                is ApiResult.Success -> UiState.Success(result.data)
                is ApiResult.HttpError -> UiState.Error(result.message, result.code)
                is ApiResult.NetworkError -> UiState.Error("Sem conexão com a internet")
            }
        }
    }
}
```

### 3.4 Composable Observando Estado

```kotlin
@Composable
fun TransactionsScreen(viewModel: TransactionsViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    // Observa expiração de sessão globalmente
    val context = LocalContext.current
    LaunchedEffect(Unit) {
        SessionEventBus.events.collect { event ->
            if (event is SessionEvent.Expired) {
                // Navegar para Login — chamado no NavHost pai
            }
        }
    }

    when (val state = uiState) {
        is UiState.Idle -> {}
        is UiState.Loading -> FullScreenLoader()
        is UiState.Success -> TransactionsList(transactions = state.data)
        is UiState.Error -> ErrorState(
            message = state.message,
            onRetry = { viewModel.loadTransactions(currentMonth, currentYear) }
        )
    }
}
```

---

## 4. Persistência Local — Cache e Suporte Offline

### 4.1 Estratégia

| Dado              | Estratégia                          | TTL Cache                      |
| ----------------- | ----------------------------------- | ------------------------------ |
| Transações        | Room + Network → DB → UI            | 5 minutos                      |
| Wallets           | Room + Network → DB → UI            | 10 minutos                     |
| Alimentos (foods) | Room apenas — dados raramente mudam | Sem expiração                  |
| Dashboard/Summary | Apenas rede (dados em tempo real)   | Sem cache                      |
| Tokens JWT        | EncryptedSharedPreferences          | Gerenciado por TTL do servidor |
| Preferências UI   | DataStore Preferences               | Sem expiração                  |

### 4.2 Room — Entidade e DAO de Exemplo

```kotlin
@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val walletId: String,
    val categoryId: String?,
    val amount: Double,
    val date: String,
    val description: String?,
    val type: String,
    val status: String,
    val cachedAt: Long = System.currentTimeMillis()
)

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions WHERE strftime('%m', date) = :month AND strftime('%Y', date) = :year")
    fun getByMonthYear(month: String, year: String): Flow<List<TransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(transactions: List<TransactionEntity>)

    @Query("DELETE FROM transactions WHERE walletId = :walletId")
    suspend fun deleteByWallet(walletId: String)

    @Query("SELECT MAX(cachedAt) FROM transactions")
    suspend fun lastCachedAt(): Long?
}
```

### 4.3 Padrão Repository com Cache-First

```kotlin
class TransactionRepositoryImpl @Inject constructor(
    private val api: TransactionApiService,
    private val dao: TransactionDao
) : TransactionRepository {

    override fun getTransactions(month: Int, year: Int): Flow<ApiResult<List<Transaction>>> = flow {
        // 1. Emite cache imediatamente (UI fica responsiva)
        val cached = dao.getByMonthYear(
            month.toString().padStart(2, '0'),
            year.toString()
        ).first()
        if (cached.isNotEmpty()) emit(ApiResult.Success(cached.map { it.toDomain() }))

        // 2. Busca rede e atualiza cache
        val result = safeApiCall { api.getTransactions(month, year) }
        if (result is ApiResult.Success) {
            dao.insertAll(result.data.map { it.toEntity() })
            emit(ApiResult.Success(result.data.map { it.toDomain() }))
        } else if (cached.isEmpty()) {
            emit(result) // Só propaga erro se não há cache
        }
    }
}
```

### 4.4 DataStore para Preferências

```kotlin
@Singleton
class UserPreferencesRepository @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {
    private val SELECTED_WALLET_KEY = stringPreferencesKey("selected_wallet_id")
    private val THEME_KEY = stringPreferencesKey("theme")

    val selectedWalletId: Flow<String?> = dataStore.data.map { it[SELECTED_WALLET_KEY] }
    val theme: Flow<String> = dataStore.data.map { it[THEME_KEY] ?: "system" }

    suspend fun setSelectedWallet(walletId: String) {
        dataStore.edit { it[SELECTED_WALLET_KEY] = walletId }
    }
}
```

---

## 5. Padronização de UI — Componentes Reutilizáveis

### 5.1 Token de Design

Defina cores, tipografia e espaçamentos em `core/ui/theme/`:

```kotlin
// Color.kt
val PrimaryGreen = Color(0xFF00C896)
val SurfaceDark = Color(0xFF1C1C1E)
val ErrorRed = Color(0xFFFF453A)
val IncomeGreen = Color(0xFF30D158)
val ExpenseRed = Color(0xFFFF453A)

// Type.kt — usando Inter ou Poppins via Google Fonts
val Typography = Typography(
    headlineMedium = TextStyle(fontFamily = InterFamily, fontWeight = FontWeight.SemiBold, fontSize = 24.sp),
    bodyLarge = TextStyle(fontFamily = InterFamily, fontWeight = FontWeight.Normal, fontSize = 16.sp),
    labelSmall = TextStyle(fontFamily = InterFamily, fontWeight = FontWeight.Medium, fontSize = 11.sp)
)
```

### 5.2 Componentes Reutilizáveis

```kotlin
// SbnButton.kt
@Composable
fun SbnButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    enabled: Boolean = true,
    variant: ButtonVariant = ButtonVariant.Primary
) {
    Button(
        onClick = onClick,
        enabled = enabled && !isLoading,
        colors = ButtonDefaults.buttonColors(
            containerColor = when (variant) {
                ButtonVariant.Primary -> MaterialTheme.colorScheme.primary
                ButtonVariant.Danger -> ErrorRed
                ButtonVariant.Ghost -> Color.Transparent
            }
        ),
        modifier = modifier.fillMaxWidth().height(52.dp)
    ) {
        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
        } else {
            Text(text = text, style = MaterialTheme.typography.labelLarge)
        }
    }
}

enum class ButtonVariant { Primary, Danger, Ghost }
```

```kotlin
// TransactionAmountText.kt
@Composable
fun TransactionAmountText(amount: Double, type: String) {
    val (color, prefix) = when (type) {
        "Receita" -> Pair(IncomeGreen, "+")
        else -> Pair(ExpenseRed, "-")
    }
    Text(
        text = "$prefix R$ ${"%.2f".format(kotlin.math.abs(amount))}",
        color = color,
        style = MaterialTheme.typography.bodyLarge,
        fontWeight = FontWeight.SemiBold
    )
}
```

```kotlin
// FullScreenLoader.kt
@Composable
fun FullScreenLoader() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
    }
}

// ErrorState.kt
@Composable
fun ErrorState(message: String, onRetry: (() -> Unit)? = null) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = ErrorRed, modifier = Modifier.size(48.dp))
        Spacer(Modifier.height(16.dp))
        Text(message, textAlign = TextAlign.Center)
        onRetry?.let {
            Spacer(Modifier.height(16.dp))
            SbnButton("Tentar novamente", onClick = it, modifier = Modifier.width(200.dp))
        }
    }
}
```

---

## 6. Navegação

### 6.1 Rotas

```kotlin
sealed class NavRoutes(val route: String) {
    // Auth
    object Login : NavRoutes("auth/login")
    object Register : NavRoutes("auth/register")

    // Finance
    object FinanceDashboard : NavRoutes("finance/dashboard")
    object Transactions : NavRoutes("finance/transactions")
    object TransactionDetail : NavRoutes("finance/transactions/{transactionId}") {
        fun createRoute(id: String) = "finance/transactions/$id"
    }
    object Wallets : NavRoutes("finance/wallets")
    object Categories : NavRoutes("finance/categories")
    object Recurrences : NavRoutes("finance/recurrences")
    object Wishlist : NavRoutes("finance/wishlist")
    object Projections : NavRoutes("finance/projections")

    // Health
    object HealthOverview : NavRoutes("health/overview")
    object MealLog : NavRoutes("health/meal-log")
    object Measurements : NavRoutes("health/measurements")

    // Settings
    object Settings : NavRoutes("settings")
    object ApiKeys : NavRoutes("settings/api-keys")
}
```

### 6.2 AppNavHost

```kotlin
@Composable
fun AppNavHost(
    navController: NavHostController = rememberNavController(),
    startDestination: String
) {
    // Observa expiração de sessão globalmente
    LaunchedEffect(Unit) {
        SessionEventBus.events.collect { event ->
            if (event is SessionEvent.Expired) {
                navController.navigate(NavRoutes.Login.route) {
                    popUpTo(0) { inclusive = true }
                }
            }
        }
    }

    NavHost(navController = navController, startDestination = startDestination) {
        composable(NavRoutes.Login.route) {
            LoginScreen(onLoginSuccess = {
                navController.navigate(NavRoutes.FinanceDashboard.route) {
                    popUpTo(NavRoutes.Login.route) { inclusive = true }
                }
            })
        }
        composable(NavRoutes.FinanceDashboard.route) { DashboardScreen(navController) }
        composable(NavRoutes.Transactions.route) { TransactionsScreen(navController) }
        composable(
            NavRoutes.TransactionDetail.route,
            arguments = listOf(navArgument("transactionId") { type = NavType.StringType })
        ) { backStack ->
            TransactionDetailScreen(
                transactionId = backStack.arguments?.getString("transactionId")!!,
                navController = navController
            )
        }
        // ... demais rotas
    }
}
```

### 6.3 Bottom Navigation

O app utiliza `NavigationBar` do Material 3 com quatro destinos principais:

```kotlin
enum class BottomNavItem(
    val route: String,
    val icon: ImageVector,
    val label: String
) {
    Finance(NavRoutes.FinanceDashboard.route, Icons.Default.AccountBalance, "Finanças"),
    Health(NavRoutes.HealthOverview.route, Icons.Default.FitnessCenter, "Saúde"),
    Wishlist(NavRoutes.Wishlist.route, Icons.Default.Favorite, "Desejos"),
    Settings(NavRoutes.Settings.route, Icons.Default.Settings, "Config"),
}
```

---

## 7. Interfaces dos Serviços Retrofit

```kotlin
interface AuthApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<LoginResponse>

    @POST("auth/refresh")
    fun refresh(@Body request: RefreshRequest): Call<TokenResponse> // Call síncrono p/ interceptor

    @POST("auth/logout")
    suspend fun logout(@Body request: LogoutRequest): Response<Unit>

    @GET("auth/me")
    suspend fun getMe(): Response<UserResponse>
}

interface TransactionApiService {
    @GET("finance/transactions")
    suspend fun getTransactions(
        @Query("month") month: Int,
        @Query("year") year: Int
    ): Response<List<TransactionResponse>>

    @GET("finance/transactions/summary")
    suspend fun getSummary(
        @Query("month") month: Int,
        @Query("year") year: Int
    ): Response<TransactionSummaryResponse>

    @POST("finance/transactions")
    suspend fun create(@Body request: CreateTransactionRequest): Response<TransactionResponse>

    @PATCH("finance/transactions/{id}")
    suspend fun update(
        @Path("id") id: String,
        @Body request: UpdateTransactionRequest
    ): Response<TransactionResponse>

    @DELETE("finance/transactions/{id}")
    suspend fun delete(@Path("id") id: String): Response<Unit>

    @Multipart
    @POST("finance/transactions/import/nubank")
    suspend fun importNubank(
        @Part file: MultipartBody.Part,
        @Part("walletId") walletId: RequestBody
    ): Response<ImportResultResponse>
}
```

---

## 8. Checklist de Segurança

- [ ] Certificado pinning para o domínio de produção (`CertificatePinner` no OkHttp)
- [ ] Access Token **nunca** salvo em disco ou logado em Logcat
- [ ] `EncryptedSharedPreferences` para Refresh Token
- [ ] ProGuard/R8 habilitado no release build — ofusca classes de DTO
- [ ] `android:allowBackup="false"` no `AndroidManifest.xml`
- [ ] Campos de senha com `KeyboardType.Password` + `PasswordVisualTransformation`
- [ ] Sem credenciais hardcodadas — usar `BuildConfig` com values de CI/CD

---

## 9. Convenções de Código

| Aspecto                   | Decisão                                                                          |
| ------------------------- | -------------------------------------------------------------------------------- |
| **Async**                 | `suspend` functions + `viewModelScope.launch` — evitar callbacks                 |
| **Estado**                | `StateFlow` no ViewModel, `collectAsStateWithLifecycle` na UI                    |
| **Injeção**               | Hilt para tudo. `@HiltViewModel` + `hiltViewModel()` nas telas                   |
| **Mapper**                | `fun TransactionDto.toDomain(): Transaction` em arquivo `Mappers.kt` por domínio |
| **Testes**                | `MockK` para mocks, `Turbine` para testar Flows, `Hilt Testing` para integration |
| **Formatação**            | `ktlint` + `detekt` — rodar no pre-commit hook                                   |
| **Coroutines dispatcher** | Injetar via constructor (`@IoDispatcher`, `@MainDispatcher`) para testabilidade  |

```kotlin
// Injetando dispatchers com Hilt
@Qualifier @Retention(AnnotationRetention.BINARY)
annotation class IoDispatcher

@Qualifier @Retention(AnnotationRetention.BINARY)
annotation class MainDispatcher

@Module @InstallIn(SingletonComponent::class)
object CoroutinesModule {
    @Provides @IoDispatcher fun provideIoDispatcher(): CoroutineDispatcher = Dispatchers.IO
    @Provides @MainDispatcher fun provideMainDispatcher(): CoroutineDispatcher = Dispatchers.Main
}
```
