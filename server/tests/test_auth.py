"""Regression checks for the sign-in and welcome flow."""

from collections.abc import Generator
from datetime import UTC, datetime

from fastapi.testclient import TestClient

from app.db import get_session
from app.main import app
from app.models import User
from app.security import hash_password, verify_password


class FakeSession:
    """Expose the account operations used by the small auth surface."""

    def __init__(self) -> None:
        now = datetime.now(UTC)
        self.user = User(
            id=1,
            username="demo",
            password_hash=hash_password("correct-password"),
            created_at=now,
            updated_at=now,
        )

    def scalar(self, _statement: object) -> User:
        return self.user

    def get(self, _model: type[User], user_id: int) -> User | None:
        return self.user if user_id == self.user.id else None


def fake_session() -> Generator[FakeSession, None, None]:
    """Give HTTP tests a known account without touching a local database."""
    yield FakeSession()


def test_password_verifier_rejects_wrong_or_malformed_password() -> None:
    """A copied or malformed verifier must not grant access."""
    encoded = hash_password("correct-password")
    assert verify_password("correct-password", encoded)
    assert not verify_password("wrong-password", encoded)
    assert not verify_password("correct-password", "bad-value")


def test_login_welcome_and_logout() -> None:
    """A valid account reaches welcome and logout ends the session."""
    app.dependency_overrides[get_session] = fake_session
    try:
        with TestClient(app) as client:
            assert client.get("/api/auth/me").status_code == 401
            assert (
                client.post(
                    "/api/auth/login",
                    json={"username": "demo", "password": "wrong-password"},
                ).status_code
                == 401
            )
            login = client.post(
                "/api/auth/login",
                json={"username": "demo", "password": "correct-password"},
            )
            assert login.status_code == 200
            assert login.json() == {"username": "demo"}
            assert client.get("/api/auth/me").json() == {"username": "demo"}
            assert client.post("/api/auth/logout").status_code == 204
            assert client.get("/api/auth/me").status_code == 401
    finally:
        app.dependency_overrides.clear()
