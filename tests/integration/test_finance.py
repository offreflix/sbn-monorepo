import requests
from utils import BASE_URL


class TestWallets:
    def test_create_wallet(self, headers):
        resp = requests.post(
            f"{BASE_URL}/finance/wallets",
            headers=headers,
            json={
                "name": "Test Wallet",
                "type": "CHECKING",
                "balance": 1000,
                "currency": "BRL",
            },
        )
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert data["name"] == "Test Wallet"

    def test_list_wallets(self, headers):
        resp = requests.get(f"{BASE_URL}/finance/wallets", headers=headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_wallet(self, headers):
        create = requests.post(
            f"{BASE_URL}/finance/wallets",
            headers=headers,
            json={"name": "Get Wallet", "type": "CHECKING", "balance": 500, "currency": "BRL"},
        )
        wallet_id = create.json()["id"]

        resp = requests.get(f"{BASE_URL}/finance/wallets/{wallet_id}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["id"] == wallet_id

    def test_update_wallet(self, headers):
        create = requests.post(
            f"{BASE_URL}/finance/wallets",
            headers=headers,
            json={"name": "Update Me", "type": "CHECKING", "balance": 0, "currency": "BRL"},
        )
        wallet_id = create.json()["id"]

        resp = requests.patch(
            f"{BASE_URL}/finance/wallets/{wallet_id}",
            headers=headers,
            json={"name": "Updated Wallet"},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Wallet"

    def test_delete_wallet(self, headers):
        create = requests.post(
            f"{BASE_URL}/finance/wallets",
            headers=headers,
            json={"name": "Delete Me", "type": "CHECKING", "balance": 0, "currency": "BRL"},
        )
        wallet_id = create.json()["id"]

        resp = requests.delete(f"{BASE_URL}/finance/wallets/{wallet_id}", headers=headers)
        assert resp.status_code == 200


class TestCategories:
    def test_create_category(self, headers):
        resp = requests.post(
            f"{BASE_URL}/finance/categories",
            headers=headers,
            json={"name": "Test Category", "type": "EXPENSE", "icon": "shopping-cart", "color": "#FF0000"},
        )
        assert resp.status_code in (200, 201)

    def test_list_categories(self, headers):
        resp = requests.get(f"{BASE_URL}/finance/categories", headers=headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_update_category(self, headers):
        create = requests.post(
            f"{BASE_URL}/finance/categories",
            headers=headers,
            json={"name": "Update Cat", "type": "EXPENSE", "icon": "edit", "color": "#00FF00"},
        )
        cat_id = create.json()["id"]

        resp = requests.patch(
            f"{BASE_URL}/finance/categories/{cat_id}",
            headers=headers,
            json={"name": "Updated Category"},
        )
        assert resp.status_code == 200

    def test_delete_category(self, headers):
        create = requests.post(
            f"{BASE_URL}/finance/categories",
            headers=headers,
            json={"name": "Delete Cat", "type": "INCOME", "icon": "trash", "color": "#0000FF"},
        )
        cat_id = create.json()["id"]

        resp = requests.delete(f"{BASE_URL}/finance/categories/{cat_id}", headers=headers)
        assert resp.status_code == 200


class TestTransactions:
    def _create_wallet_and_category(self, headers):
        wallet = requests.post(
            f"{BASE_URL}/finance/wallets",
            headers=headers,
            json={"name": "Tx Wallet", "type": "CHECKING", "balance": 5000, "currency": "BRL"},
        ).json()

        category = requests.post(
            f"{BASE_URL}/finance/categories",
            headers=headers,
            json={"name": "Tx Category", "type": "EXPENSE", "icon": "tag", "color": "#333333"},
        ).json()

        return wallet["id"], category["id"]

    def test_create_transaction(self, headers):
        wallet_id, category_id = self._create_wallet_and_category(headers)

        resp = requests.post(
            f"{BASE_URL}/finance/transactions",
            headers=headers,
            json={
                "walletId": wallet_id,
                "categoryId": category_id,
                "amount": 150.50,
                "type": "Despesa",
                "description": "Test transaction",
                "date": "2026-02-12T00:00:00.000Z",
                "isPaid": True,
            },
        )
        assert resp.status_code in (200, 201)

    def test_list_transactions(self, headers):
        resp = requests.get(f"{BASE_URL}/finance/transactions", headers=headers)
        assert resp.status_code == 200

    def test_get_transaction(self, headers):
        wallet_id, category_id = self._create_wallet_and_category(headers)

        create = requests.post(
            f"{BASE_URL}/finance/transactions",
            headers=headers,
            json={
                "walletId": wallet_id,
                "categoryId": category_id,
                "amount": 50,
                "type": "Receita",
                "description": "Get me",
                "date": "2026-02-12T00:00:00.000Z",
                "isPaid": True,
            },
        )
        tx_id = create.json()["id"]

        resp = requests.get(f"{BASE_URL}/finance/transactions/{tx_id}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["id"] == tx_id

    def test_update_transaction(self, headers):
        wallet_id, category_id = self._create_wallet_and_category(headers)

        create = requests.post(
            f"{BASE_URL}/finance/transactions",
            headers=headers,
            json={
                "walletId": wallet_id,
                "categoryId": category_id,
                "amount": 75,
                "type": "Despesa",
                "description": "Update me",
                "date": "2026-02-12T00:00:00.000Z",
                "isPaid": False,
            },
        )
        tx_id = create.json()["id"]

        resp = requests.patch(
            f"{BASE_URL}/finance/transactions/{tx_id}",
            headers=headers,
            json={"description": "Updated transaction"},
        )
        assert resp.status_code == 200

    def test_delete_transaction(self, headers):
        wallet_id, category_id = self._create_wallet_and_category(headers)

        create = requests.post(
            f"{BASE_URL}/finance/transactions",
            headers=headers,
            json={
                "walletId": wallet_id,
                "categoryId": category_id,
                "amount": 25,
                "type": "Despesa",
                "description": "Delete me",
                "date": "2026-02-12T00:00:00.000Z",
                "isPaid": True,
            },
        )
        tx_id = create.json()["id"]

        resp = requests.delete(f"{BASE_URL}/finance/transactions/{tx_id}", headers=headers)
        assert resp.status_code == 200

    def test_transaction_summary(self, headers):
        resp = requests.get(f"{BASE_URL}/finance/transactions/summary", headers=headers)
        assert resp.status_code == 200


class TestDashboard:
    def test_dashboard_summary(self, headers):
        resp = requests.get(
            f"{BASE_URL}/finance/dashboard/summary",
            headers=headers,
            params={"month": 2, "year": 2026},
        )
        assert resp.status_code == 200

    def test_dashboard_categories(self, headers):
        resp = requests.get(
            f"{BASE_URL}/finance/dashboard/categories",
            headers=headers,
            params={"month": 2, "year": 2026},
        )
        assert resp.status_code == 200


class TestProjections:
    def test_projections(self, headers):
        resp = requests.get(f"{BASE_URL}/finance/projections", headers=headers)
        assert resp.status_code == 200


class TestWishlist:
    def test_create_wishlist_item(self, headers):
        resp = requests.post(
            f"{BASE_URL}/finance/wishlist",
            headers=headers,
            json={
                "name": "Test Item",
                "price": 299.99,
                "url": "https://example.com/item",
                "priority": "HIGH",
            },
        )
        assert resp.status_code in (200, 201)

    def test_list_wishlist(self, headers):
        resp = requests.get(f"{BASE_URL}/finance/wishlist", headers=headers)
        assert resp.status_code == 200

    def test_update_wishlist_item(self, headers):
        create = requests.post(
            f"{BASE_URL}/finance/wishlist",
            headers=headers,
            json={"name": "Update Item", "price": 100, "priority": "LOW"},
        )
        item_id = create.json()["id"]

        resp = requests.patch(
            f"{BASE_URL}/finance/wishlist/{item_id}",
            headers=headers,
            json={"name": "Updated Item"},
        )
        assert resp.status_code == 200

    def test_mark_purchased(self, headers):
        create = requests.post(
            f"{BASE_URL}/finance/wishlist",
            headers=headers,
            json={"name": "Buy Me", "price": 50, "priority": "MEDIUM"},
        )
        item_id = create.json()["id"]

        resp = requests.patch(
            f"{BASE_URL}/finance/wishlist/{item_id}/purchase",
            headers=headers,
        )
        assert resp.status_code == 200

    def test_delete_wishlist_item(self, headers):
        create = requests.post(
            f"{BASE_URL}/finance/wishlist",
            headers=headers,
            json={"name": "Delete Item", "price": 10, "priority": "LOW"},
        )
        item_id = create.json()["id"]

        resp = requests.delete(f"{BASE_URL}/finance/wishlist/{item_id}", headers=headers)
        assert resp.status_code == 200


class TestFinanceUnauthorized:
    def test_finance_unauthorized(self):
        resp = requests.get(f"{BASE_URL}/finance/wallets")
        assert resp.status_code in (401, 403, 404)
