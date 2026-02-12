import pytest
from utils import generate_unique_email, register_user, login_user, auth_headers


@pytest.fixture(scope="session")
def test_user():
    email = generate_unique_email()
    password = "TestPass123!"
    name = "Integration Test User"

    reg = register_user(email, password, name)
    assert reg.status_code in (200, 201), f"Registration failed: {reg.text}"

    login = login_user(email, password)
    assert login.status_code in (200, 201), f"Login failed: {login.text}"

    data = login.json()
    return {
        "email": email,
        "password": password,
        "name": name,
        "accessToken": data["accessToken"],
        "refreshToken": data["refreshToken"],
        "user": data.get("user", {}),
    }


@pytest.fixture(scope="session")
def headers(test_user):
    return auth_headers(test_user["accessToken"])
