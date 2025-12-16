export type User = {
  id: string
  email: string
  name?: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type AuthResponse = AuthTokens & {
  user: User
}

export type RefreshResponse = AuthTokens

