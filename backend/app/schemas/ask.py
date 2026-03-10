from typing import List

from pydantic import BaseModel


class AskRequest(BaseModel):
    question: str
    case_id: int | None = None


class AskResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence: float

