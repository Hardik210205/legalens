from fastapi import APIRouter, Depends

from ..models.user import User
from ..schemas.ask import AskRequest, AskResponse
from ..services.ask import handle_ask
from ..services.security import get_current_user


router = APIRouter()


@router.post("/", response_model=AskResponse)
def ask(
    request: AskRequest,
    current_user: User = Depends(get_current_user),
):
    # current_user is injected for authentication; not used in the mock.
    return handle_ask(request, session_id=str(current_user.id))

