"""
Router: questions — add, edit, delete, and reorder questions.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Form, Question, QuestionOption, _utcnow
from schemas import (
    QuestionCreate,
    QuestionOut,
    QuestionReorderRequest,
    QuestionUpdate,
)

router = APIRouter(tags=["Questions"])


# ── Helpers ──────────────────────────────────────────────────────────────

def _get_question_or_404(question_id: str, db: Session) -> Question:
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Question not found")
    return question


def _sync_options(question: Question, options_in: list, db: Session) -> None:
    """Replace a question's options with the incoming list."""
    # Delete existing options
    for opt in list(question.options):
        db.delete(opt)
    db.flush()

    # Create new options
    for opt_in in options_in:
        db.add(QuestionOption(
            question_id=question.id,
            label=opt_in.label,
            order=opt_in.order,
        ))


# ── Endpoints ────────────────────────────────────────────────────────────

@router.post(
    "/forms/{form_id}/questions",
    response_model=QuestionOut,
    status_code=status.HTTP_201_CREATED,
)
def add_question(form_id: str, body: QuestionCreate, db: Session = Depends(get_db)):
    """Add a question to a form. Order is auto-assigned to next position."""
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Form not found")

    # Determine next order value
    max_order = (
        db.query(func.max(Question.order))
        .filter(Question.form_id == form_id)
        .scalar()
    )
    next_order = (max_order or 0) + 1

    question = Question(
        form_id=form_id,
        type=body.type,
        title=body.title,
        description=body.description,
        required=body.required,
        order=next_order,
        settings=body.settings,
    )
    db.add(question)
    db.flush()  # populate question.id

    # Create options for choice/dropdown types
    if body.options:
        for opt in body.options:
            db.add(QuestionOption(
                question_id=question.id,
                label=opt.label,
                order=opt.order,
            ))

    # Touch the parent form's updated_at
    form.updated_at = _utcnow()

    db.commit()
    db.refresh(question)
    return question


@router.put("/questions/{question_id}", response_model=QuestionOut)
def update_question(question_id: str, body: QuestionUpdate, db: Session = Depends(get_db)):
    """Update a question's fields. If options are provided, they replace the existing set."""
    question = _get_question_or_404(question_id, db)

    if body.title is not None:
        question.title = body.title
    if body.description is not None:
        question.description = body.description
    if body.required is not None:
        question.required = body.required
    if body.settings is not None:
        question.settings = body.settings

    # Replace options if provided
    if body.options is not None:
        _sync_options(question, body.options, db)

    # Touch the parent form's updated_at
    form = db.get(Form, question.form_id)
    if form:
        form.updated_at = _utcnow()

    db.commit()
    db.refresh(question)
    return question


@router.delete("/questions/{question_id}", status_code=status.HTTP_200_OK)
def delete_question(question_id: str, db: Session = Depends(get_db)):
    """Delete a question (cascades to options and answers)."""
    question = _get_question_or_404(question_id, db)

    # Touch the parent form's updated_at
    form = db.get(Form, question.form_id)
    if form:
        form.updated_at = _utcnow()

    db.delete(question)
    db.commit()
    return {"detail": "Question deleted"}


@router.put("/forms/{form_id}/questions/reorder")
def reorder_questions(
    form_id: str,
    body: QuestionReorderRequest,
    db: Session = Depends(get_db),
):
    """
    Accept a list of {question_id, order} pairs and update all
    positions in one call (for drag-and-drop).
    """
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Form not found")

    # Build a lookup of questions belonging to this form
    form_question_ids = {
        q.id
        for q in db.query(Question.id).filter(Question.form_id == form_id).all()
    }

    for item in body.items:
        if item.question_id not in form_question_ids:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"Question '{item.question_id}' does not belong to this form",
            )
        question = db.get(Question, item.question_id)
        question.order = item.order

    form.updated_at = _utcnow()
    db.commit()

    return {"detail": "Questions reordered"}
