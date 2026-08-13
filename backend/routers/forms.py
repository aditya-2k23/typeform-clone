"""
Router: /forms — creator-side CRUD, publish/unpublish, duplicate.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Form, Question, QuestionOption, Response as ResponseModel, _generate_slug, _utcnow
from schemas import (
    FormCreate,
    FormDetail,
    FormListItem,
    FormPublishOut,
    FormUpdate,
)

router = APIRouter(prefix="/forms", tags=["Forms"])


# ── Helpers ──────────────────────────────────────────────────────────────

def _get_form_or_404(form_id: str, db: Session) -> Form:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


# ── Endpoints ────────────────────────────────────────────────────────────

@router.get("", response_model=list[FormListItem])
def list_forms(db: Session = Depends(get_db)):
    """List all forms with question and response counts."""
    forms = db.query(Form).order_by(Form.created_at.desc()).all()

    results: list[FormListItem] = []
    for form in forms:
        q_count = db.query(func.count(Question.id)).filter(Question.form_id == form.id).scalar()
        r_count = db.query(func.count(ResponseModel.id)).filter(ResponseModel.form_id == form.id).scalar()
        results.append(
            FormListItem(
                id=form.id,
                title=form.title,
                description=form.description,
                status=form.status,
                slug=form.slug,
                question_count=q_count or 0,
                response_count=r_count or 0,
                created_at=form.created_at,
                updated_at=form.updated_at,
            )
        )
    return results


@router.post("", response_model=FormDetail, status_code=status.HTTP_201_CREATED)
def create_form(body: FormCreate, db: Session = Depends(get_db)):
    """Create a new draft form."""
    form = Form(title=body.title, description=body.description)
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


@router.get("/{form_id}", response_model=FormDetail)
def get_form(form_id: str, db: Session = Depends(get_db)):
    """Get a form with its full ordered list of questions (including options)."""
    form = (
        db.query(Form)
        .options(
            joinedload(Form.questions).joinedload(Question.options)
        )
        .filter(Form.id == form_id)
        .first()
    )
    if not form:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


@router.put("/{form_id}", response_model=FormDetail)
def update_form(form_id: str, body: FormUpdate, db: Session = Depends(get_db)):
    """Update a form's title and/or description."""
    form = _get_form_or_404(form_id, db)

    if body.title is not None:
        form.title = body.title
    if body.description is not None:
        form.description = body.description
    form.updated_at = _utcnow()

    db.commit()
    db.refresh(form)
    return form


@router.delete("/{form_id}", status_code=status.HTTP_200_OK)
def delete_form(form_id: str, db: Session = Depends(get_db)):
    """Delete a form and all associated data (cascade)."""
    form = _get_form_or_404(form_id, db)
    db.delete(form)
    db.commit()
    return {"detail": "Form deleted"}


@router.post("/{form_id}/duplicate", response_model=FormDetail, status_code=status.HTTP_201_CREATED)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    """
    Create a full copy of a form — new id, new slug, status reset to draft.
    All questions and their options are copied.
    """
    original = (
        db.query(Form)
        .options(
            joinedload(Form.questions).joinedload(Question.options)
        )
        .filter(Form.id == form_id)
        .first()
    )
    if not original:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Form not found")

    new_form = Form(
        title=f"{original.title} (Copy)",
        description=original.description,
        status="draft",
        slug=_generate_slug(),
    )
    db.add(new_form)
    db.flush()  # populate new_form.id

    for q in original.questions:
        new_q = Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            order=q.order,
            settings=q.settings,
        )
        db.add(new_q)
        db.flush()

        for opt in q.options:
            new_opt = QuestionOption(
                question_id=new_q.id,
                label=opt.label,
                order=opt.order,
            )
            db.add(new_opt)

    db.commit()
    # Re-query with eager loads for the response
    new_form = (
        db.query(Form)
        .options(
            joinedload(Form.questions).joinedload(Question.options)
        )
        .filter(Form.id == new_form.id)
        .first()
    )
    return new_form


@router.post("/{form_id}/publish", response_model=FormPublishOut)
def publish_form(form_id: str, db: Session = Depends(get_db)):
    """Set a form's status to 'published' and return its public URL."""
    form = _get_form_or_404(form_id, db)

    if not form.slug:
        form.slug = _generate_slug()

    form.status = "published"
    form.updated_at = _utcnow()
    db.commit()
    db.refresh(form)

    return FormPublishOut(
        id=form.id,
        status=form.status,
        slug=form.slug,
        public_url=f"/public/forms/{form.slug}",
    )


@router.post("/{form_id}/unpublish", response_model=FormDetail)
def unpublish_form(form_id: str, db: Session = Depends(get_db)):
    """Set a form's status back to 'draft'."""
    form = _get_form_or_404(form_id, db)
    form.status = "draft"
    form.updated_at = _utcnow()
    db.commit()
    db.refresh(form)
    return form
