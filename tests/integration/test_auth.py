import requests
from utils import BASE_URL, generate_unique_email, register_user, login_user, auth_headers


class TestAuth:
    def test_register(self):
        email = generate_unique_email()
        resp = register_user(email, "TestPass123!", "New User")
        assert resp.status_code in (200, 201)

    def test_login(self):
        email = generate_unique_email()
        register_user(email, "TestPass123!")
        resp = login_user(email, "TestPass123!")
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert "accessToken" in data
        assert "refreshToken" in data

    def test_login_invalid(self):
        email = generate_unique_email()
        register_user(email, "TestPass123!")
        resp = login_user(email, "WrongPassword!")
        assert resp.status_code == 401

    def test_refresh_token(self, test_user):
        resp = requests.post(
            f"{BASE_URL}/auth/refresh",
            json={"refreshToken": test_user["refreshToken"]},
        )
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert "accessToken" in data

    def test_get_me(self, test_user):
        resp = requests.get(
            f"{BASE_URL}/auth/me",
            headers=auth_headers(test_user["accessToken"]),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == test_user["email"]

    def test_get_me_unauthorized(self):
        resp = requests.get(f"{BASE_URL}/auth/me")
        assert resp.status_code == 401

    def test_logout(self):
        email = generate_unique_email()
        register_user(email, "TestPass123!")
        login_resp = login_user(email, "TestPass123!")
        data = login_resp.json()

        resp = requests.post(
            f"{BASE_URL}/auth/logout",
            headers=auth_headers(data["accessToken"]),
            json={"refreshToken": data["refreshToken"]},
        )
        assert resp.status_code in (200, 201)
