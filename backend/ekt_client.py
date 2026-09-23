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