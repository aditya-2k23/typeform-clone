"""
SQLAlchemy ORM models for the Typeform clone.

Tables:
  - Form: A survey/form container.
  - Question: An individual question belonging to a form.
  - QuestionOption: A selectable option for multiple_choice / dropdown questions.
  - Response: A single submission to a form.
  - Answer: An individual answer to a question within a response.
"""

import uuid
import string
import random
from datetime import datetime, timezone

from sqlalchemy import (
    String,
    Text,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def _generate_slug(length: int = 8) -> str:
    """Generate a short random alphanumeric slug for public share links."""
    alphabet = string.ascii_lowercase + string.digits
    return "".join(random.choices(alphabet, k=length))


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# Models
class Form(Base):
    """
    A form/survey that contains questions and collects responses.
    """
    __tablename__ = "forms"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )
    slug: Mapped[str] = mapped_column(
        String(32), unique=True, nullable=False, default=_generate_slug
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    # Relationships
    questions: Mapped[list["Question"]] = relationship(
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Question.order",
    )
    responses: Mapped[list["Response"]] = relationship(
        back_populates="form",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Form id={self.id!r} title={self.title!r} status={self.status!r}>"


class Question(Base):
    """
    A single question within a form.

    Supported types:
        short_text, long_text, multiple_choice, dropdown,
        email, number, yes_no, rating
    """
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    form_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(30), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    required: Mapped[bool] = mapped_column(Boolean, default=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Relationships
    form: Mapped["Form"] = relationship(back_populates="questions")
    options: Mapped[list["QuestionOption"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.order",
    )
    answers: Mapped[list["Answer"]] = relationship(
        back_populates="question",
    )

    def __repr__(self) -> str:
        return f"<Question id={self.id!r} type={self.type!r} title={self.title!r}>"


class QuestionOption(Base):
    """
    A selectable option for multiple_choice and dropdown question types.
    """
    __tablename__ = "question_options"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    question_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    question: Mapped["Question"] = relationship(back_populates="options")

    def __repr__(self) -> str:
        return f"<QuestionOption id={self.id!r} label={self.label!r}>"


class Response(Base):
    """
    A single submission (collection of answers) to a form.
    Public — no authentication required.
    """
    __tablename__ = "responses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    form_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False
    )
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )

    # Relationships
    form: Mapped["Form"] = relationship(back_populates="responses")
    answers: Mapped[list["Answer"]] = relationship(
        back_populates="response",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Response id={self.id!r} form_id={self.form_id!r}>"


class Answer(Base):
    """
    An individual answer to a question within a response.
    All values are stored as text for simplicity.
    """
    __tablename__ = "answers"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    response_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("responses.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("questions.id"),
        nullable=False,
    )
    value: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    response: Mapped["Response"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship(back_populates="answers")

    def __repr__(self) -> str:
        return f"<Answer id={self.id!r} question_id={self.question_id!r}>"
