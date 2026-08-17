from typing import cast
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.session import engine
from app.db.base import Base
from app import models
from app import auth, news, contact, users, departments, modules, module_access, uploads, history

app = FastAPI(title=settings.APP_NAME)

app.state.limiter = limiter


def _handle_rate_limit_exceeded(request: Request, exc: Exception) -> Response:
    return _rate_limit_exceeded_handler(request, cast(RateLimitExceeded, exc))


app.add_exception_handler(RateLimitExceeded, _handle_rate_limit_exceeded)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(news.router)
app.include_router(contact.router)
app.include_router(users.router)
app.include_router(departments.router)
app.include_router(modules.router)
app.include_router(module_access.router)
app.include_router(uploads.router)
app.include_router(history.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
