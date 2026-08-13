"""
Pydantic schemas for request/response validation across all API endpoints.
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


# Shared / Reusable

QUESTION_TYPES = {
    "short_text",
    "long_text",
    "multiple_choice",
    "dropdown",
    "email",
    "number",
    "yes_no",
    "rating",
}

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# QuestionOption

class QuestionOptionOut(BaseModel):
    id: str
    label: str
    order: int

    model_config = {"from_attributes": True}


class QuestionOptionIn(BaseModel):
    """Used when creating/updating a question's options."""
    label: str = Field(..., min_length=1, max_length=255)
    order: int = Field(..., ge=0)


# Question

class QuestionOut(BaseModel):
    id: str
    form_id: str
    type: str
    title: str
    description: str | None = None
    required: bool
    order: int
    settings: dict[str, Any] | None = None
    options: list[QuestionOptionOut] = []

    model_config = {"from_attributes": True}


class QuestionCreate(BaseModel):
    type: str
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    required: bool = False
    settings: dict[str, Any] | None = None
    options: list[QuestionOptionIn] | None = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in QUESTION_TYPES:
            raise ValueError(
                f"Invalid question type '{v}'. "
                f"Must be one of: {', '.join(sorted(QUESTION_TYPES))}"
            )
        return v


class QuestionUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=500)
    description: str | None = None
    required: bool | None = None
    settings: dict[str, Any] | None = None
    options: list[QuestionOptionIn] | None = None


class QuestionReorderItem(BaseModel):
    question_id: str
    order: int = Field(..., ge=0)


class QuestionReorderRequest(BaseModel):
    items: list[QuestionReorderItem] = Field(..., min_length=1)


# Form

class FormListItem(BaseModel):
    id: str
    title: str
    description: str | None = None
    status: str
    slug: str
    question_count: int
    response_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FormDetail(BaseModel):
    id: str
    title: str
    description: str | None = None
    status: str
    slug: str
    created_at: datetime
    updated_at: datetime
    questions: list[QuestionOut] = []

    model_config = {"from_attributes": True}


class FormCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None


class FormUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None


class FormPublishOut(BaseModel):
    id: str
    status: str
    slug: str
    public_url: str

    model_config = {"from_attributes": True}


# Public form (respondent-facing)

class PublicFormOut(BaseModel):
    """Stripped-down form view for the public fill experience."""
    id: str
    title: str
    description: str | None = None
    slug: str
    questions: list[QuestionOut] = []

    model_config = {"from_attributes": True}


# Response / Answer (submission)

class AnswerIn(BaseModel):
    question_id: str
    value: str


class AnswerOut(BaseModel):
    id: str
    question_id: str
    value: str

    model_config = {"from_attributes": True}


class SubmitResponseRequest(BaseModel):
    answers: list[AnswerIn] = Field(..., min_length=1)


class SubmitResponseOut(BaseModel):
    response_id: str


# Results — response listing & detail

class AnswerPreview(BaseModel):
    question_title: str
    value: str


class ResponseListItem(BaseModel):
    id: str
    submitted_at: datetime
    preview: list[AnswerPreview] = []

    model_config = {"from_attributes": True}


class AnswerDetail(BaseModel):
    question_id: str
    question_title: str
    question_type: str
    value: str


class ResponseDetail(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    answers: list[AnswerDetail] = []

    model_config = {"from_attributes": True}


# Stats

class OptionCount(BaseModel):
    label: str
    count: int


class QuestionStat(BaseModel):
    question_id: str
    question_title: str
    question_type: str
    total_answered: int
    option_counts: list[OptionCount] | None = None   # choice / dropdown / yes_no
    average_rating: float | None = None                # rating
    rating_distribution: dict[str, int] | None = None  # rating


class FormStats(BaseModel):
    form_id: str
    total_responses: int
    questions: list[QuestionStat] = []
