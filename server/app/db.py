"""Database connection and request-scoped sessions for demo accounts."""

import os
from collections.abc import Generator

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    """Collect persisted models for Alembic."""


# Keep the connection explicit so the application cannot silently use another database.
database_url = os.environ.get("DATABASE_URL")
engine = create_engine(database_url, pool_pre_ping=True) if database_url else None
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False) if engine else None


def get_session() -> Generator[Session, None, None]:
    """Give each request its own database session and close it afterward."""
    if SessionLocal is None:
        raise HTTPException(status_code=503, detail="Database is not configured")
    with SessionLocal() as session:
        yield session
