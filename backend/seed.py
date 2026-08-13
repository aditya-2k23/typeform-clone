"""
Seed script — populates the database with sample forms, questions, options,
responses, and answers so the app has data to display immediately.

Usage:
    cd backend
    python seed.py

Running this script is idempotent-ish: it drops all existing data and
re-seeds from scratch each time.
"""

from database import engine, SessionLocal, Base

# Ensure models are registered before create_all
import models  # noqa: F401

from models import Form, Question, QuestionOption, Response, Answer


def seed():
    # Recreate all tables (wipes existing data)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # FORM 1 — Customer Feedback Survey
        form1 = Form(
            title="Customer Feedback Survey",
            description=(
                "We'd love to hear about your experience! "
                "This quick survey helps us improve our products and services."
            ),
            status="published",
            slug="feedback-2024",
        )
        db.add(form1)
        db.flush()  # Populate form1.id

        # Questions

        q1_1 = Question(
            form_id=form1.id,
            type="short_text",
            title="What is your name?",
            description="Just your first name is fine.",
            required=True,
            order=1,
        )
        q1_2 = Question(
            form_id=form1.id,
            type="email",
            title="What is your email address?",
            description="We'll only use this to follow up if needed.",
            required=True,
            order=2,
        )
        q1_3 = Question(
            form_id=form1.id,
            type="multiple_choice",
            title="How did you hear about us?",
            required=False,
            order=3,
        )
        q1_4 = Question(
            form_id=form1.id,
            type="rating",
            title="How would you rate your overall experience?",
            description="1 = terrible, 5 = outstanding",
            required=True,
            order=4,
            settings={"max_rating": 5},
        )
        q1_5 = Question(
            form_id=form1.id,
            type="long_text",
            title="Any additional comments or suggestions?",
            required=False,
            order=5,
        )

        db.add_all([q1_1, q1_2, q1_3, q1_4, q1_5])
        db.flush()

        # Options for "How did you hear about us?"
        opts_q1_3 = [
            QuestionOption(question_id=q1_3.id, label="Google Search", order=1),
            QuestionOption(question_id=q1_3.id, label="Social Media", order=2),
            QuestionOption(question_id=q1_3.id, label="Friend or Colleague", order=3),
            QuestionOption(question_id=q1_3.id, label="Blog or Article", order=4),
            QuestionOption(question_id=q1_3.id, label="Other", order=5),
        ]
        db.add_all(opts_q1_3)
        db.flush()

        # Responses & Answers

        r1_1 = Response(form_id=form1.id)
        db.add(r1_1)
        db.flush()
        db.add_all([
            Answer(response_id=r1_1.id, question_id=q1_1.id, value="Alice"),
            Answer(response_id=r1_1.id, question_id=q1_2.id, value="alice@example.com"),
            Answer(response_id=r1_1.id, question_id=q1_3.id, value="Social Media"),
            Answer(response_id=r1_1.id, question_id=q1_4.id, value="5"),
            Answer(response_id=r1_1.id, question_id=q1_5.id, value="Love the product! Keep it up."),
        ])

        r1_2 = Response(form_id=form1.id)
        db.add(r1_2)
        db.flush()
        db.add_all([
            Answer(response_id=r1_2.id, question_id=q1_1.id, value="Bob"),
            Answer(response_id=r1_2.id, question_id=q1_2.id, value="bob@example.com"),
            Answer(response_id=r1_2.id, question_id=q1_3.id, value="Google Search"),
            Answer(response_id=r1_2.id, question_id=q1_4.id, value="4"),
            Answer(response_id=r1_2.id, question_id=q1_5.id, value="Pretty good, could use a dark mode."),
        ])

        r1_3 = Response(form_id=form1.id)
        db.add(r1_3)
        db.flush()
        db.add_all([
            Answer(response_id=r1_3.id, question_id=q1_1.id, value="Charlie"),
            Answer(response_id=r1_3.id, question_id=q1_2.id, value="charlie@example.com"),
            Answer(response_id=r1_3.id, question_id=q1_3.id, value="Friend or Colleague"),
            Answer(response_id=r1_3.id, question_id=q1_4.id, value="3"),
            Answer(response_id=r1_3.id, question_id=q1_5.id, value="Navigation was a bit confusing."),
        ])

        r1_4 = Response(form_id=form1.id)
        db.add(r1_4)
        db.flush()
        db.add_all([
            Answer(response_id=r1_4.id, question_id=q1_1.id, value="Diana"),
            Answer(response_id=r1_4.id, question_id=q1_2.id, value="diana@example.com"),
            Answer(response_id=r1_4.id, question_id=q1_3.id, value="Blog or Article"),
            Answer(response_id=r1_4.id, question_id=q1_4.id, value="5"),
            Answer(response_id=r1_4.id, question_id=q1_5.id, value="Absolutely fantastic experience!"),
        ])

        # FORM 2 — Tech Conference Registration
        form2 = Form(
            title="Tech Conference 2024 Registration",
            description=(
                "Register for our annual tech conference. "
                "Fill out this form to secure your spot!"
            ),
            status="published",
            slug="techconf-2024",
        )
        db.add(form2)
        db.flush()

        # Questions

        q2_1 = Question(
            form_id=form2.id,
            type="short_text",
            title="Full Name",
            required=True,
            order=1,
        )
        q2_2 = Question(
            form_id=form2.id,
            type="email",
            title="Email Address",
            description="We'll send your confirmation and ticket here.",
            required=True,
            order=2,
        )
        q2_3 = Question(
            form_id=form2.id,
            type="dropdown",
            title="Which track are you most interested in?",
            required=True,
            order=3,
        )
        q2_4 = Question(
            form_id=form2.id,
            type="multiple_choice",
            title="What topics would you like covered?",
            description="Select all that interest you.",
            required=False,
            order=4,
        )
        q2_5 = Question(
            form_id=form2.id,
            type="number",
            title="How many years of professional experience do you have?",
            required=False,
            order=5,
            settings={"min": 0, "max": 50},
        )
        q2_6 = Question(
            form_id=form2.id,
            type="yes_no",
            title="Would you like to volunteer as a speaker?",
            required=False,
            order=6,
        )
        q2_7 = Question(
            form_id=form2.id,
            type="rating",
            title="How excited are you about this event?",
            description="1 = not very, 10 = can't wait!",
            required=False,
            order=7,
            settings={"max_rating": 10},
        )

        db.add_all([q2_1, q2_2, q2_3, q2_4, q2_5, q2_6, q2_7])
        db.flush()

        # Options for track dropdown
        opts_q2_3 = [
            QuestionOption(question_id=q2_3.id, label="Frontend Development", order=1),
            QuestionOption(question_id=q2_3.id, label="Backend & APIs", order=2),
            QuestionOption(question_id=q2_3.id, label="Machine Learning / AI", order=3),
            QuestionOption(question_id=q2_3.id, label="DevOps & Cloud", order=4),
            QuestionOption(question_id=q2_3.id, label="Security", order=5),
        ]

        # Options for topics multiple choice
        opts_q2_4 = [
            QuestionOption(question_id=q2_4.id, label="React / Next.js", order=1),
            QuestionOption(question_id=q2_4.id, label="Python / FastAPI", order=2),
            QuestionOption(question_id=q2_4.id, label="Rust", order=3),
            QuestionOption(question_id=q2_4.id, label="Kubernetes", order=4),
            QuestionOption(question_id=q2_4.id, label="LLMs & Generative AI", order=5),
            QuestionOption(question_id=q2_4.id, label="System Design", order=6),
        ]

        db.add_all(opts_q2_3 + opts_q2_4)
        db.flush()

        # Responses & Answers

        r2_1 = Response(form_id=form2.id)
        db.add(r2_1)
        db.flush()
        db.add_all([
            Answer(response_id=r2_1.id, question_id=q2_1.id, value="Evelyn Park"),
            Answer(response_id=r2_1.id, question_id=q2_2.id, value="evelyn.park@example.com"),
            Answer(response_id=r2_1.id, question_id=q2_3.id, value="Machine Learning / AI"),
            Answer(response_id=r2_1.id, question_id=q2_4.id, value="LLMs & Generative AI"),
            Answer(response_id=r2_1.id, question_id=q2_5.id, value="6"),
            Answer(response_id=r2_1.id, question_id=q2_6.id, value="yes"),
            Answer(response_id=r2_1.id, question_id=q2_7.id, value="9"),
        ])

        r2_2 = Response(form_id=form2.id)
        db.add(r2_2)
        db.flush()
        db.add_all([
            Answer(response_id=r2_2.id, question_id=q2_1.id, value="Frank Miller"),
            Answer(response_id=r2_2.id, question_id=q2_2.id, value="frank.miller@example.com"),
            Answer(response_id=r2_2.id, question_id=q2_3.id, value="DevOps & Cloud"),
            Answer(response_id=r2_2.id, question_id=q2_4.id, value="Kubernetes"),
            Answer(response_id=r2_2.id, question_id=q2_5.id, value="12"),
            Answer(response_id=r2_2.id, question_id=q2_6.id, value="no"),
            Answer(response_id=r2_2.id, question_id=q2_7.id, value="7"),
        ])

        r2_3 = Response(form_id=form2.id)
        db.add(r2_3)
        db.flush()
        db.add_all([
            Answer(response_id=r2_3.id, question_id=q2_1.id, value="Grace Chen"),
            Answer(response_id=r2_3.id, question_id=q2_2.id, value="grace.chen@example.com"),
            Answer(response_id=r2_3.id, question_id=q2_3.id, value="Frontend Development"),
            Answer(response_id=r2_3.id, question_id=q2_4.id, value="React / Next.js"),
            Answer(response_id=r2_3.id, question_id=q2_5.id, value="3"),
            Answer(response_id=r2_3.id, question_id=q2_6.id, value="no"),
            Answer(response_id=r2_3.id, question_id=q2_7.id, value="10"),
        ])

        db.commit()
        print("✅ Seed complete!")
        print()

        # Quick summary
        form_count = db.query(Form).count()
        question_count = db.query(Question).count()
        option_count = db.query(QuestionOption).count()
        response_count = db.query(Response).count()
        answer_count = db.query(Answer).count()

        print(f"   Forms:            {form_count}")
        print(f"   Questions:        {question_count}")
        print(f"   Question Options: {option_count}")
        print(f"   Responses:        {response_count}")
        print(f"   Answers:          {answer_count}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
