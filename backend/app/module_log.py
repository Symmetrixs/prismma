from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, aliased
from pydantic import BaseModel
from app.db.session import get_db
from app.core.deps import require_superadmin
from app.models import User, ModuleActionLog

router = APIRouter(prefix="/module-log", tags=["module-log"])


class ModuleLogEntry(BaseModel):
    id: int
    target_label: str
    action: str
    detail: str | None
    actor_name: str | None
    created_at: datetime | None


@router.get("/{module_slug}", response_model=list[ModuleLogEntry])
def get_module_log(
    module_slug: str,
    limit: int = 200,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    limit = min(max(limit, 1), 500)
    Actor = aliased(User)
    rows = (
        db.query(ModuleActionLog, Actor)
        .outerjoin(Actor, ModuleActionLog.performed_by == Actor.id)
        .filter(ModuleActionLog.module == module_slug)
        .order_by(ModuleActionLog.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    return [
        ModuleLogEntry(
            id=log.id,
            target_label=log.target_label,
            action=log.action,
            detail=log.detail,
            actor_name=actor.name if actor else None,
            created_at=log.created_at,
        )
        for log, actor in rows
    ]
