import httpx
from .config import SBN_API_KEY, SBN_API_BASE_URL


def get_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url=SBN_API_BASE_URL,
        headers={"X-API-Key": SBN_API_KEY},
        timeout=30.0,
    )


async def api_request(
    method: str,
    path: str,
    *,
    json: dict | None = None,
    params: dict | None = None,
) -> dict | list | str:
    async with get_client() as client:
        response = await client.request(
            method,
            path,
            json=json,
            params=params,
        )
        response.raise_for_status()
        return response.json()
