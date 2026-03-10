from typing import Optional

from pydantic import BaseModel


class CaseBase(BaseModel):
    title: str
    description: Optional[str] = None


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class CaseRead(CaseBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

