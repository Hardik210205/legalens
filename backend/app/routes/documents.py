import os

import aiofiles
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..models.user import User
from ..models import Document
from ..schemas.document import DocumentRead
from ..services import documents as document_service
from ..services.security import get_current_user


router = APIRouter()

settings = get_settings()


@router.get("/", response_model=List[DocumentRead])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    documents = (
        db.query(Document)
        .filter(Document.owner_id == current_user.id)
        .order_by(Document.id.desc())
        .all()
    )
    return documents


@router.post("/", response_model=DocumentRead)
@router.post("/upload", response_model=DocumentRead)
async def upload_document(
    file: UploadFile = File(...),
    case_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_location = os.path.join(settings.UPLOAD_DIR, file.filename)

    file_bytes = await file.read()
    async with aiofiles.open(file_location, "wb") as out_file:
        await out_file.write(file_bytes)

    document = document_service.save_document(
        db=db,
        owner=current_user,
        file_location=file_location,
        filename=file.filename,
        content_type=file.content_type,
        case_id=case_id,
    )
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.owner_id == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    db.delete(document)
    db.commit()
    return None

