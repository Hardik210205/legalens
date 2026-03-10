from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models import Case, Document
from ..models.user import User


def save_document(
    db: Session,
    owner: User,
    file_location: str,
    filename: str,
    content_type: Optional[str],
    case_id: Optional[int] = None,
) -> Document:
    if case_id is not None:
        case = (
            db.query(Case)
            .filter(Case.id == case_id, Case.owner_id == owner.id)
            .first()
        )
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found for this user",
            )
    else:
        case = None

    document = Document(
        filename=filename,
        content_type=content_type or "application/octet-stream",
        path=file_location,
        case_id=case.id if case else None,
        owner_id=owner.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

