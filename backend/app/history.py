from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, aliased
from pydantic import BaseModel
from app.db.session import get_db
from app.core.deps import require_superadmin
from app.models import User, Department, RoleChangeHistory, ModuleAccess, Module, PasswordResetRequest, AccountActionLog

router = APIRouter(prefix="/history", tags=["history"])

LABELS = {
    "role_change": "Role changed",
    "module_access_approved": "Module access approved",
    "module_access_rejected": "Module access rejected",
    "module_access_revoked": "Module access revoked",
    "password_reset_approved": "Password reset approved",
    "registration_approved": "Registration approved",
    "registration_rejected": "Registration rejected",
    "disabled": "Account disabled",
    "enabled": "Account enabled",
    "blocked": "Account blocked",
    "unblocked": "Account unblocked",
}


class HistoryEntry(BaseModel):
    id: str
    type: str
    label: str
    actor_id: int | None
    actor_name: str | None
    target_id: int
    target_name: str
    target_department: str | None
    detail: str | None
    created_at: datetime | None


@router.get("", response_model=list[HistoryEntry])
def get_history(db: Session = Depends(get_db), current_user: User = Depends(require_superadmin)):
    entries: list[HistoryEntry] = []
    Target = aliased(User)
    Actor = aliased(User)

    role_changes = (
        db.query(RoleChangeHistory, Target, Actor, Department)
        .join(Target, RoleChangeHistory.user_id == Target.id)
        .outerjoin(Actor, RoleChangeHistory.changed_by == Actor.id)
        .outerjoin(Department, Target.department_id == Department.id)
        .all()
    )
    for rc, target, actor, dept in role_changes:
        entries.append(HistoryEntry(
            id=f"role-{rc.id}",
            type="role_change",
            label=LABELS["role_change"],
            actor_id=rc.changed_by,
            actor_name=actor.name if actor else None,
            target_id=target.id,
            target_name=target.name,
            target_department=dept.name if dept else None,
            detail=f"{rc.old_role} to {rc.new_role}",
            created_at=rc.changed_at,
        ))

    module_type_map = {
        "approved": "module_access_approved",
        "rejected": "module_access_rejected",
        "revoked": "module_access_revoked",
    }
    module_decisions = (
        db.query(ModuleAccess, Target, Actor, Module, Department)
        .join(Target, ModuleAccess.user_id == Target.id)
        .outerjoin(Actor, ModuleAccess.decided_by == Actor.id)
        .join(Module, ModuleAccess.module_id == Module.id)
        .outerjoin(Department, Target.department_id == Department.id)
        .filter(ModuleAccess.status.in_(list(module_type_map.keys())))
        .all()
    )
    for ma, target, actor, module, dept in module_decisions:
        entry_type = module_type_map[ma.status]
        detail = module.name
        if ma.rejection_reason:
            detail = f"{module.name}, {ma.rejection_reason}"
        entries.append(HistoryEntry(
            id=f"module-{ma.id}",
            type=entry_type,
            label=LABELS[entry_type],
            actor_id=ma.decided_by,
            actor_name=actor.name if actor else None,
            target_id=target.id,
            target_name=target.name,
            target_department=dept.name if dept else None,
            detail=detail,
            created_at=ma.decided_at,
        ))

    resets = (
        db.query(PasswordResetRequest, Target, Actor, Department)
        .join(Target, PasswordResetRequest.user_id == Target.id)
        .outerjoin(Actor, PasswordResetRequest.decided_by == Actor.id)
        .outerjoin(Department, Target.department_id == Department.id)
        .filter(PasswordResetRequest.status == "approved")
        .all()
    )
    for pr, target, actor, dept in resets:
        entries.append(HistoryEntry(
            id=f"reset-{pr.id}",
            type="password_reset_approved",
            label=LABELS["password_reset_approved"],
            actor_id=pr.decided_by,
            actor_name=actor.name if actor else None,
            target_id=target.id,
            target_name=target.name,
            target_department=dept.name if dept else None,
            detail=None,
            created_at=pr.decided_at,
        ))

    actions = (
        db.query(AccountActionLog, Target, Actor, Department)
        .join(Target, AccountActionLog.target_user_id == Target.id)
        .outerjoin(Actor, AccountActionLog.performed_by == Actor.id)
        .outerjoin(Department, Target.department_id == Department.id)
        .all()
    )
    for log, target, actor, dept in actions:
        entry_label = LABELS[log.action] if log.action in LABELS else log.action
        entries.append(HistoryEntry(
            id=f"action-{log.id}",
            type=log.action,
            label=entry_label,
            actor_id=log.performed_by,
            actor_name=actor.name if actor else None,
            target_id=target.id,
            target_name=target.name,
            target_department=dept.name if dept else None,
            detail=log.reason,
            created_at=log.created_at,
        ))

    entries.sort(key=lambda e: e.created_at or datetime.min, reverse=True)
    return entries
