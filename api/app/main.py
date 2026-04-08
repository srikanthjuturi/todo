import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.category_router import router as category_router
from app.routes.tag_router import router as tag_router
from app.routes.todo_router import router as todo_router
from app.schemas.response import error

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Todo API",
    version="1.0.0",
    description="Single-user Todo application API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todo_router, prefix="/api/v1")
app.include_router(category_router, prefix="/api/v1")
app.include_router(tag_router, prefix="/api/v1")


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Wrap HTTPException in the standard ApiResponse envelope.

    Args:
        request: The incoming request.
        exc: The raised HTTPException.

    Returns:
        JSONResponse with ApiResponse envelope and appropriate status code.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=jsonable_encoder(
            error(exc.status_code, [str(exc.detail)]),
            by_alias=True,
        ),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Wrap Pydantic validation errors in the standard ApiResponse envelope.

    Args:
        request: The incoming request.
        exc: The raised RequestValidationError.

    Returns:
        JSONResponse with 422 status and list of validation error messages.
    """
    messages = [
        f"{' → '.join(str(loc) for loc in err['loc'])}: {err['msg']}"
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder(
            error(422, messages),
            by_alias=True,
        ),
    )


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Return service health status.

    Returns:
        Dict with status key confirming the service is running.
    """
    return {"status": "ok"}
