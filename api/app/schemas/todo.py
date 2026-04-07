from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

from app.schemas.tag import TagResponse


class TodoBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    """Shared fields for create and update schemas.

    Attributes:
        title: Task title, required, 1–255 characters, must not be blank.
        description: Optional task description, max 1000 characters.
    """

    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str) -> str:
        """Reject titles that contain only whitespace.

        Args:
            v: The raw title string.

        Returns:
            The original value if valid.

        Raises:
            ValueError: If the title is blank or whitespace-only.
        """
        if not v.strip():
            raise ValueError("Title must not be blank")
        return v


class TodoCreate(TodoBase):
    """Schema for creating a new todo. Inherits all fields from TodoBase."""

    category_id: int | None = None
    tag_ids: list[int] | None = None


class TodoUpdate(BaseModel):
    """Schema for updating an existing todo. All fields are optional.

    Attributes:
        title: New title, 1–255 characters, must not be blank.
        description: New description, max 1000 characters. Pass null to clear.
        is_completed: New completion state.
        category_id: Category id to assign or null to clear.
        tag_ids: List of tag ids to attach to the todo.
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    is_completed: bool | None = None
    category_id: int | None = None
    tag_ids: list[int] | None = None

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str | None) -> str | None:
        """Reject titles that contain only whitespace.

        Args:
            v: The raw title string or None.

        Returns:
            The original value if valid or None.

        Raises:
            ValueError: If the title is blank or whitespace-only.
        """
        if v is not None and not v.strip():
            raise ValueError("Title must not be blank")
        return v


class TodoResponse(TodoBase):
    """Schema for serialising a todo in API responses.

    Attributes:
        id: Primary key.
        is_completed: Completion state.
        created_at: Creation timestamp.
        updated_at: Last update timestamp.
        category_id: Assigned category id.
        category_name: Assigned category name.
        tags: List of attached tags.
    """

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    category_id: int | None = None
    category_name: str | None = None
    tags: list[TagResponse] = Field(default_factory=list)
