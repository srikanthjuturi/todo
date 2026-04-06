from datetime import datetime, timezone
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard envelope wrapping all API responses.

    Attributes:
        status_code: HTTP status code mirrored in the body.
        is_success: True when the operation succeeded.
        data: Response payload — object, list, or None.
        timestamp: UTC ISO-8601 timestamp of when the response was produced.
        errors: Human-readable error messages; None on success.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    status_code: int
    is_success: bool
    data: T | None = None
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    errors: list[str] | None = None


def success(data: T, status_code: int = 200) -> ApiResponse[T]:
    """Build a success envelope.

    Args:
        data: The payload to include in the response.
        status_code: HTTP status code, default 200.

    Returns:
        ApiResponse with isSuccess=True and the given data.
    """
    return ApiResponse(
        status_code=status_code,
        is_success=True,
        data=data,
        errors=None,
    )


def error(status_code: int, errors: list[str]) -> ApiResponse[None]:
    """Build an error envelope.

    Args:
        status_code: HTTP status code.
        errors: List of human-readable error messages.

    Returns:
        ApiResponse with isSuccess=False and error details.
    """
    return ApiResponse(
        status_code=status_code,
        is_success=False,
        data=None,
        errors=errors,
    )
