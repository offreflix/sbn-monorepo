import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthProvider";

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockRefresh = vi.fn();
const mockLogout = vi.fn();

vi.mock("../api/auth", () => ({
  authApi: {
    login: (...args: unknown[]) => mockLogin(...args),
    register: (...args: unknown[]) => mockRegister(...args),
    refresh: (...args: unknown[]) => mockRefresh(...args),
    logout: (...args: unknown[]) => mockLogout(...args),
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
            return;
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
    window.__SBN_AUTH__ = undefined;
    mockRefresh.mockRejectedValue(new Error("no session"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  it("realiza login e persiste somente usuario", async () => {
    mockLogin.mockResolvedValueOnce({
      accessToken: "access-1",
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
    expect(stored.user.email).toBe("test@email.com");
    expect(stored.tokens).toBeUndefined();
    expect(window.__SBN_AUTH__?.getAccessToken()).toBe("access-1");
  });

  it("renova token ao receber 401 e refaz requisicao", async () => {
    window.__SBN_AUTH__ = {
      getAccessToken: () => "expired",
      setAccessToken: vi.fn(),
      clear: vi.fn(),
    };

    mockRefresh.mockResolvedValueOnce({
      accessToken: "access-new",
      user: { id: "u1", email: "demo@email.com" },
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
    expect(mockRefresh).toHaveBeenCalledWith();

    const secondCall = fetchSpy.mock.calls[1];
    const headers = secondCall?.[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer access-new");
  });
});
