import os

import httpx
from dotenv import load_dotenv


load_dotenv()

EKT_API_URL = os.getenv(
    "EKT_API_URL",
    "https://ekt.kz/api",
)

EKT_API_USERNAME = os.getenv("EKT_API_USERNAME")
EKT_API_PASSWORD = os.getenv("EKT_API_PASSWORD")


def get_auth():
    if EKT_API_USERNAME and EKT_API_PASSWORD:
        return httpx.BasicAuth(
            EKT_API_USERNAME,
            EKT_API_PASSWORD,
        )

    return None


def get_products(page: int = 1) -> dict:
    response = httpx.get(
        f"{EKT_API_URL}/products",
        params={"page": page},
        auth=get_auth(),
        timeout=20,
        follow_redirects=True,
    )

    response.raise_for_status()
    return response.json()


def get_product_detail(product_id: int) -> dict:
    response = httpx.get(
        f"{EKT_API_URL}/products/detail",
        params={"id": product_id},
        auth=get_auth(),
        timeout=20,
        follow_redirects=True,
    )

    response.raise_for_status()
    return response.json()

def get_products(page: int = 1) -> dict:
    response = httpx.get(
        f"{EKT_API_URL}/products",
        params={"page": page},
        auth=get_auth(),
        timeout=20,
        follow_redirects=True,
    )

    response.raise_for_status()
    return response.json()

def normalize_text(value: str) -> str:
    return " ".join(str(value).lower().split())


def search_products(
    query: str,
    max_pages: int = 10,
    limit: int = 10,
) -> dict:
    normalized_query = normalize_text(query)
    query_words = normalized_query.split()

    found_products = []

    for page in range(1, max_pages + 1):
        data = get_products(page)
        items = data.get("items", [])

        if not items:
            break

        for product in items:
            searchable_text = normalize_text(
                f"{product.get('id', '')} "
                f"{product.get('article', '')} "
                f"{product.get('name', '')}"
            )

            if all(word in searchable_text for word in query_words):
                found_products.append(product)

            if len(found_products) >= limit:
                return {
                    "query": query,
                    "count": len(found_products),
                    "items": found_products,
                }

        per_page = data.get("per_page", len(items))

        if len(items) < per_page:
            break

    return {
        "query": query,
        "count": len(found_products),
        "items": found_products,
    }

def normalize_text(value: str) -> str:
    return " ".join(str(value).lower().split())


def search_products(
    query: str,
    max_pages: int = 10,
    limit: int = 10,
) -> dict:
    normalized_query = normalize_text(query)
    query_words = normalized_query.split()

    found_products = []

    for page in range(1, max_pages + 1):
        data = get_products(page)
        items = data.get("items", [])

        if not items:
            break

        for product in items:
            searchable_text = normalize_text(
                f"{product.get('id', '')} "
                f"{product.get('article', '')} "
                f"{product.get('name', '')}"
            )

            if all(word in searchable_text for word in query_words):
                found_products.append(product)

            if len(found_products) >= limit:
                return {
                    "query": query,
                    "count": len(found_products),
                    "items": found_products,
                }

        per_page = data.get("per_page", len(items))

        if len(items) < per_page:
            break

    return {
        "query": query,
        "count": len(found_products),
        "items": found_products,
    }