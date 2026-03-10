from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.user import Token, UserCreate, UserRead
from ..services import users as user_service

from ..services.security import get_current_user
from ..models import User

router = APIRouter()


@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = user_service.register_user(db, user_in)
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    access_token = user_service.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    return Token(access_token=access_token)

