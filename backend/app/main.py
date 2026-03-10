import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from .config import get_settings
from .database import Base, engine
from .routes import auth, cases, documents, ask, users

settings = get_settings()

Base.metadata.create_all(bind=engine)


def ensure_user_role_column():
    try:
        insp = inspect(engine)
        cols = [c["name"] for c in insp.get_columns("users")]
        if "role" not in cols:
            with engine.begin() as conn:
                conn.execute(
                    text(
                        "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'member'"
                    )
                )
    except Exception:
        # Best-effort lightweight migration for local/prod without Alembic.
        pass


ensure_user_role_column()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(cases.router, prefix="/cases", tags=["cases"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(ask.router, prefix="/ask", tags=["ask"])
app.include_router(users.router, prefix="/users", tags=["users"])


def ensure_upload_dir():
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)


ensure_upload_dir()

