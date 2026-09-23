import httpx
from fastapi import FastAPI, HTTPException, Query

from ekt_client import (
    get_product_detail,
    get_products,
    search_products,
)


app = FastAPI(
    title="EKT AI Assistant API",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {
        "message": "EKT AI Assistant API",
        "docs": "/docs",
    }

@app.get("/products")
def products(page: int = Query(default=1, ge=1)):
    try:
        return get_products(page)

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=502,
            detail=f"EKT API returned status {error.response.status_code}",
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="EKT API is unavailable",
        )

@app.get("/products/search")
def product_search(
    q: str = Query(min_length=2),
    max_pages: int = Query(default=10, ge=1, le=100),
    limit: int = Query(default=10, ge=1, le=20),
):
    try:
        return search_products(
            query=q,
            max_pages=max_pages,
            limit=limit,
        )

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=502,
            detail=f"EKT API returned status {error.response.status_code}",
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="EKT API is unavailable",
        )

@app.get("/products/{product_id}")
def product_detail(product_id: int):
    try:
        return get_product_detail(product_id)

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=502,
            detail=f"EKT API returned status {error.response.status_code}",
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="EKT API is unavailable",
        )