from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.case import CaseCreate, CaseRead, CaseUpdate
from ..services import cases as case_service
from ..services.security import get_current_user


router = APIRouter()


@router.post("/", response_model=CaseRead)
def create_case(
    case_in: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return case_service.create_case(db, current_user, case_in)


@router.get("/", response_model=List[CaseRead])
def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return case_service.list_cases(db, current_user)


@router.get("/{case_id}", response_model=CaseRead)
def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return case_service.get_case(db, case_id, current_user)


@router.put("/{case_id}", response_model=CaseRead)
def update_case(
    case_id: int,
    case_in: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return case_service.update_case(db, case_id, current_user, case_in)


@router.delete("/{case_id}", status_code=204)
def delete_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case_service.delete_case(db, case_id, current_user)
    return None

