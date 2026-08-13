"""
Router: /public — respondent-facing endpoints (no auth required).
"""

import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Form, Question, Response as ResponseModel, Answer
from schemas import (
    AnswerIn,
    PublicFormOut,
    SubmitResponseOut,
    SubmitResponseRequest,
    EMAIL_RE,
)

router = APIRouter(prefix="/public", tags=["Public"])


# Endpoints

@router.get("/forms/{slug}", response_model=PublicFormOut)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    """
    Fetch a published form by its slug (for the fill experience).
    Returns 404 if the form doesn't exist or isn't published.
    """
    form = (
        db.query(Form)
        .options(
            joinedload(Form.questions).joinedload(Question.options)
        )
        .filter(Form.slug == slug, Form.status == "published")
        .first()
    )
    if not form:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail="Form not found or not published",
        )
    return form


@router.post(
    "/forms/{slug}/responses",
    response_model=SubmitResponseOut,
    status_code=status.HTTP_201_CREATED,
)
def submit_response(
    slug: str,
    body: SubmitResponseRequest,
    db: Session = Depends(get_db),
):
    """
    Submit a full response to a published form.

    Validation:
      - Required questions must have a non-empty value.
      - Email-type questions must look like a valid email.
      - Number-type questions must be numeric.
    """
    form = (
        db.query(Form)
        .options(joinedload(Form.questions))
        .filter(Form.slug == slug, Form.status == "published")
        .first()
    )
    if not form:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail="Form not found or not published",
        )

    # Index questions for fast lookup
    questions_by_id: dict[str, Question] = {q.id: q for q in form.questions}

    # Index submitted answers by question_id
    answers_by_qid: dict[str, AnswerIn] = {}
    for ans in body.answers:
        if ans.question_id not in questions_by_id:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"Question '{ans.question_id}' does not belong to this form",
            )
        answers_by_qid[ans.question_id] = ans

    # Validate each question
    errors: list[str] = []
    for question in form.questions:
        answer = answers_by_qid.get(question.id)
        value = (answer.value if answer else "").strip()

        # Required check
        if question.required and not value:
            errors.append(f"Question '{question.title}' is required")
            continue

        # Skip further validation if empty and not required
        if not value:
            continue

        # Type-specific validation
        if question.type == "email" and not EMAIL_RE.match(value):
            errors.append(
                f"Question '{question.title}' requires a valid email address"
            )

        if question.type == "number":
            try:
                float(value)
            except ValueError:
                errors.append(
                    f"Question '{question.title}' requires a numeric value"
                )

    if errors:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail={"validation_errors": errors},
        )

    # Create the response and answers
    response = ResponseModel(form_id=form.id)
    db.add(response)
    db.flush()

    for ans in body.answers:
        db.add(Answer(
            response_id=response.id,
            question_id=ans.question_id,
            value=ans.value,
        ))

    db.commit()
    db.refresh(response)

    return SubmitResponseOut(response_id=response.id)
