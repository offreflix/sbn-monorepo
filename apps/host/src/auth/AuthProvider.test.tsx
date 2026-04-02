import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthProvider";

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockRefresh = vi.fn();

vi.mock("../api/auth", () => ({
  authApi: {
    login: (...args: unknown[]) => mockLogin(...args),
    register: (...args: unknown[]) => mockRegister(...args),
    refresh: (...args: unknown[]) => mockRefresh(...args),
  },
}));

const SESSION_KEY = "sbn-auth-session";

const TestLoginComponent = () => {
  const { user, login } = useAuth();

  return (
    <div>
      <div data-testid="email">{user?.email ?? ""}</div>
      <button
        onClick={() =>
          login({ email: "test@email.com", password: "123456" }).catch(() => {
            /* swallow for test */
          })
        }
      >
        login
      </button>
    </div>
  );
};

const TestFetchComponent = () => {
  const { authFetch } = useAuth();
  return (
    <button
      onClick={() => {
        authFetch("/secure");
      }}
    >
      fetch
    </button>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("realiza login e persiste sessão", async () => {
    mockLogin.mockResolvedValueOnce({
      accessToken: "access-1",
      refreshToken: "refresh-1",
      user: { id: "u1", email: "test@email.com", name: "Test" },
    });

    render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>,
    );

    await userEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(screen.getByTestId("email").textContent).toBe("test@email.com"),
    );

    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
    expect(stored.tokens.accessToken).toBe("access-1");
    expect(stored.user.email).toBe("test@email.com");
  });

  it("renova token ao receber 401 e refaz requisição", async () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        user: { id: "u1", email: "demo@email.com" },
        tokens: { accessToken: "expired", refreshToken: "refresh-old" },
      }),
    );

    mockRefresh.mockResolvedValueOnce({
      accessToken: "access-new",
      refreshToken: "refresh-new",
    });

    const firstResponse = new Response(null, { status: 401 });
    const secondResponse = new Response(null, { status: 200 });
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce(secondResponse);

    render(
      <AuthProvider>
        <TestFetchComponent />
      </AuthProvider>,
    );

    await userEvent.click(screen.getByText("fetch"));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    expect(mockRefresh).toHaveBeenCalledWith("refresh-old");

    const secondCall = fetchSpy.mock.calls[1];
    const headers = secondCall?.[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer access-new");
  });
});
