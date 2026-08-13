"""
Router: responses & stats — view results for a form.
"""

import csv
import io
from collections import Counter

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import (
    Answer,
    Form,
    Question,
    QuestionOption,
    Response as ResponseModel,
)
from schemas import (
    AnswerDetail,
    AnswerPreview,
    FormStats,
    OptionCount,
    QuestionStat,
    ResponseDetail,
    ResponseListItem,
)

router = APIRouter(tags=["Responses"])


# ── Helpers ──────────────────────────────────────────────────────────────

def _get_form_or_404(form_id: str, db: Session) -> Form:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


# ── Endpoints ────────────────────────────────────────────────────────────

@router.get("/forms/{form_id}/responses", response_model=list[ResponseListItem])
def list_responses(form_id: str, db: Session = Depends(get_db)):
    """
    List all responses for a form.
    Each item includes a short preview of the first 3 answers.
    """
    _get_form_or_404(form_id, db)

    responses = (
        db.query(ResponseModel)
        .options(joinedload(ResponseModel.answers).joinedload(Answer.question))
        .filter(ResponseModel.form_id == form_id)
        .order_by(ResponseModel.submitted_at.desc())
        .all()
    )

    results: list[ResponseListItem] = []
    for resp in responses:
        # Sort answers by question order for a meaningful preview
        sorted_answers = sorted(resp.answers, key=lambda a: a.question.order if a.question else 0)
        preview = [
            AnswerPreview(
                question_title=ans.question.title,
                value=ans.value,
            )
            for ans in sorted_answers[:3]
        ]
        results.append(
            ResponseListItem(
                id=resp.id,
                submitted_at=resp.submitted_at,
                preview=preview,
            )
        )

    return results


@router.get("/forms/{form_id}/responses/export")
def export_responses_csv(form_id: str, db: Session = Depends(get_db)):
    """
    Export all responses for a form as a CSV spreadsheet.
    Columns: Response ID, Submitted At, and one column per question in order.
    """
    form = (
        db.query(Form)
        .options(joinedload(Form.questions))
        .filter(Form.id == form_id)
        .first()
    )
    if not form:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Form not found")

    sorted_questions = sorted(form.questions, key=lambda q: q.order)

    responses = (
        db.query(ResponseModel)
        .options(joinedload(ResponseModel.answers))
        .filter(ResponseModel.form_id == form_id)
        .order_by(ResponseModel.submitted_at.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    headers = ["Response ID", "Submitted At"] + [q.title for q in sorted_questions]
    writer.writerow(headers)

    # Data rows
    for resp in responses:
        ans_by_qid = {ans.question_id: ans.value for ans in resp.answers}
        row = [
            resp.id,
            resp.submitted_at.isoformat() if resp.submitted_at else "",
        ]
        for q in sorted_questions:
            row.append(ans_by_qid.get(q.id, ""))
        writer.writerow(row)

    output.seek(0)
    filename = f"{form.slug or 'form'}-responses.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/forms/{form_id}/responses/{response_id}", response_model=ResponseDetail)
def get_response_detail(form_id: str, response_id: str, db: Session = Depends(get_db)):
    """Full detail of one response: every question paired with its answer."""
    _get_form_or_404(form_id, db)

    response = (
        db.query(ResponseModel)
        .options(joinedload(ResponseModel.answers).joinedload(Answer.question))
        .filter(
            ResponseModel.id == response_id,
            ResponseModel.form_id == form_id,
        )
        .first()
    )
    if not response:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Response not found")

    sorted_answers = sorted(response.answers, key=lambda a: a.question.order if a.question else 0)
    answer_details = [
        AnswerDetail(
            question_id=ans.question_id,
            question_title=ans.question.title,
            question_type=ans.question.type,
            value=ans.value,
        )
        for ans in sorted_answers
    ]

    return ResponseDetail(
        id=response.id,
        form_id=response.form_id,
        submitted_at=response.submitted_at,
        answers=answer_details,
    )


@router.get("/forms/{form_id}/stats", response_model=FormStats)
def get_form_stats(form_id: str, db: Session = Depends(get_db)):
    """
    Per-question summary statistics:
      - multiple_choice / dropdown / yes_no → count per option
      - rating → average + distribution
      - text / email / number → total answered count
    """
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

    total_responses = (
        db.query(func.count(ResponseModel.id))
        .filter(ResponseModel.form_id == form_id)
        .scalar() or 0
    )

    question_stats: list[QuestionStat] = []

    for question in sorted(form.questions, key=lambda q: q.order):
        answers = (
            db.query(Answer.value)
            .filter(Answer.question_id == question.id)
            .all()
        )
        values = [a[0] for a in answers]
        total_answered = len(values)

        stat = QuestionStat(
            question_id=question.id,
            question_title=question.title,
            question_type=question.type,
            total_answered=total_answered,
        )

        if question.type in ("multiple_choice", "dropdown"):
            # Count occurrences of each option label
            counter = Counter(values)
            # Include all defined options (even those with 0 picks)
            option_labels = [opt.label for opt in question.options]
            stat.option_counts = [
                OptionCount(label=label, count=counter.get(label, 0))
                for label in option_labels
            ]

        elif question.type == "yes_no":
            counter = Counter(v.lower() for v in values)
            stat.option_counts = [
                OptionCount(label="yes", count=counter.get("yes", 0)),
                OptionCount(label="no", count=counter.get("no", 0)),
            ]

        elif question.type == "rating":
            numeric_values: list[float] = []
            rating_counter: Counter = Counter()
            for v in values:
                try:
                    num = float(v)
                    numeric_values.append(num)
                    rating_counter[str(int(num))] = rating_counter.get(str(int(num)), 0) + 1
                except ValueError:
                    pass

            if numeric_values:
                stat.average_rating = round(sum(numeric_values) / len(numeric_values), 2)
            stat.rating_distribution = dict(sorted(rating_counter.items()))

        # For text / email / number: total_answered is already set

        question_stats.append(stat)

    return FormStats(
        form_id=form_id,
        total_responses=total_responses,
        questions=question_stats,
    )
