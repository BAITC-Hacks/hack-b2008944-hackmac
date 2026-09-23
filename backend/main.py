import httpx
from fastapi import FastAPI, HTTPException, Query

from pydantic import BaseModel, Field

from cart_store import (
    add_cart_item,
    get_cart,
    get_cart_quantity,
)

from ekt_client import (
    get_product_detail,
    get_products,
    search_products,
)
from pydantic import BaseModel, Field



app = FastAPI(
    title="EKT AI Assistant API",
    version="0.1.0",
)
class AddToCartRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=100)
    product_id: int
    quantity: int = Field(gt=0)
    confirmed: bool = False


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

@app.get("/cart")
def cart(session_id: str = Query(min_length=1)):
    return get_cart(session_id)


@app.post("/cart/add")
def cart_add(request: AddToCartRequest):
    if not request.confirmed:
        raise HTTPException(
            status_code=400,
            detail="Explicit confirmation is required",
        )

    try:
        product = get_product_detail(request.product_id)

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

    available_quantity = int(product.get("quantity") or 0)

    current_quantity = get_cart_quantity(
        request.session_id,
        request.product_id,
    )

    requested_total = current_quantity + request.quantity

    if requested_total > available_quantity:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Insufficient stock",
                "available_quantity": available_quantity,
                "current_cart_quantity": current_quantity,
            },
        )

    updated_cart = add_cart_item(
        session_id=request.session_id,
        product=product,
        quantity=request.quantity,
    )

    return {
        "status": "success",
        "message": "Product added to cart",
        "cart": updated_cart,
        "cart_url": f"/cart?session_id={request.session_id}",
    }