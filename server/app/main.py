"""HTTP endpoints for entering and leaving the Wine Journal demo."""

import os
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from app.db import get_session
from app.models import User
from app.security import verify_password

SessionDependency = Annotated[Session, Depends(get_session)]


class Credentials(BaseModel):
    """Credentials submitted from the sign-in form."""

    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1)


class Account(BaseModel):
    """The account name shown on the welcome page."""

    username: str


app = FastAPI(title="Wine Journal API")

# Session cookies hold only the account ID; the server verifies the account on each visit.
secret = os.environ.get("APP_SESSION_SECRET", "")
if not secret and os.environ.get("APP_ENV") != "test":
    raise RuntimeError("APP_SESSION_SECRET must be configured")
app.add_middleware(
    SessionMiddleware,
    secret_key=secret or "test-only-session-secret",
    same_site="lax",
    https_only=os.environ.get("APP_COOKIE_SECURE") == "true",
)


@app.post("/api/auth/login", response_model=Account)
def login(
    credentials: Credentials, request: Request, session: SessionDependency
) -> Account:
    """Start a session after checking a stored demo account."""
    user = session.scalar(select(User).where(User.username == credentials.username))
    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    request.session["user_id"] = user.id
    return Account(username=user.username)


@app.get("/api/auth/me", response_model=Account)
def current_account(request: Request, session: SessionDependency) -> Account:
    """Restore the welcome page only for an existing account session."""
    user_id = request.session.get("user_id")
    if not isinstance(user_id, int):
        raise HTTPException(status_code=401, detail="Sign in required")
    user = session.get(User, user_id)
    if user is None:
        request.session.clear()
        raise HTTPException(status_code=401, detail="Sign in required")
    return Account(username=user.username)


@app.post("/api/auth/logout", status_code=204)
def logout(request: Request) -> Response:
    """Remove the browser session when someone leaves the demo."""
    request.session.clear()
    return Response(status_code=204)
