from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models import User
from ..schemas.user import UserCreate
from .security import get_password_hash, verify_password, create_access_token


def register_user(db: Session, user_in: UserCreate) -> User:
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    is_first_user = db.query(User).count() == 0
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role="admin" if is_first_user else "member",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> str:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.email)
    return access_token

