import time
import requests

BASE_URL = "http://localhost:56080/api"


def generate_unique_email():
    return f"test_{int(time.time() * 1000)}@test.com"


def register_user(email, password, name="Test User"):
    return requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": email, "password": password, "name": name},
    )


def login_user(email, password):
    resp = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password},
    )
    return resp


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}
