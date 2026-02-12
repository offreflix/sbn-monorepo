import { afterEach, describe, expect, it, vi } from "vitest";
import { authApi } from "./auth";

describe("authApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("chama /login com payload e retorna dados", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          accessToken: "a",
          refreshToken: "r",
          user: { id: "1" },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await authApi.login({ email: "a", password: "b" });

    expect(result.accessToken).toBe("a");
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/auth/login");
    expect(init?.method).toBe("POST");
  });

  it("propaga erro amigável ao receber status de erro", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Credenciais inválidas" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(authApi.login({ email: "x", password: "y" })).rejects.toThrow(
      "Credenciais inválidas",
    );
  });
});
