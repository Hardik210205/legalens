from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models import Case
from ..models.user import User
from ..schemas.case import CaseCreate, CaseUpdate


def create_case(db: Session, owner: User, case_in: CaseCreate) -> Case:
    case = Case(
        title=case_in.title,
        description=case_in.description,
        owner_id=owner.id,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


def get_case(db: Session, case_id: int, owner: User) -> Case:
    case = (
        db.query(Case)
        .filter(Case.id == case_id, Case.owner_id == owner.id)
        .first()
    )
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return case


def list_cases(db: Session, owner: User) -> List[Case]:
    return db.query(Case).filter(Case.owner_id == owner.id).all()


def update_case(
    db: Session, case_id: int, owner: User, case_in: CaseUpdate
) -> Case:
    case = get_case(db, case_id, owner)

    if case_in.title is not None:
        case.title = case_in.title
    if case_in.description is not None:
        case.description = case_in.description

    db.commit()
    db.refresh(case)
    return case


def delete_case(db: Session, case_id: int, owner: User) -> None:
    case = get_case(db, case_id, owner)
    db.delete(case)
    db.commit()

