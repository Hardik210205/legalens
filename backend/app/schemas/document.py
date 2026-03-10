from typing import Optional

from pydantic import BaseModel


class DocumentBase(BaseModel):
    filename: str
    content_type: str
    case_id: Optional[int] = None


class DocumentRead(DocumentBase):
    id: int
    path: str
    owner_id: int

    class Config:
        from_attributes = True

