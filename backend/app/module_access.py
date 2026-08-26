from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.core.deps import get_current_user, require_admin, require_superadmin
from app.models import ModuleAccess, Module, User
from app.users import visible_to_admin

router = APIRouter(prefix="/module-access", tags=["module-access"])


class ModuleAccessRead(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    module_id: int
    module_name: str
    status: str
    rejection_reason: str | None
    granted_by: int | None
    requested_at: datetime | None
    decided_at: datetime | None


class GrantRequest(BaseModel):
    user_id: int
    module_id: int


class DecisionRequest(BaseModel):
    rejection_reason: str | None = None


def _serialize(access: ModuleAccess) -> ModuleAccessRead:
    return ModuleAccessRead(
        id=access.id,
        user_id=access.user_id,
        user_name=access.user.name,
        user_email=access.user.email,
        module_id=access.module_id,
        module_name=access.module.name,
        status=access.status,
        rejection_reason=access.rejection_reason,
        granted_by=access.granted_by,
        requested_at=access.requested_at,
        decided_at=access.decided_at,
    )


@router.get("/mine", response_model=list[ModuleAccessRead])
def my_access(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(ModuleAccess).filter(
        ModuleAccess.user_id == current_user.id).all()
    return [_serialize(access) for access in rows]


@router.post("/request/{module_id}", response_model=ModuleAccessRead)
def request_access(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.is_blocked:
        raise HTTPException(
            status_code=403, detail="Your account is blocked from submitting requests")

    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    if module.slug in ("admin-operations", "site-settings"):
        raise HTTPException(status_code=400, detail="This module isn't requestable, access is role-based instead")

    existing_pending = (
        db.query(ModuleAccess)
        .filter(
            ModuleAccess.user_id == current_user.id,
            ModuleAccess.module_id == module_id,
            ModuleAccess.status == "pending",
        )
        .first()
    )
    if existing_pending:
        raise HTTPException(
            status_code=400, detail="A request for this module is already pending")

    access = ModuleAccess(user_id=current_user.id,
                          module_id=module_id, status="pending")
    db.add(access)
    db.commit()
    db.refresh(access)
    return _serialize(access)


@router.post("/grant", response_model=ModuleAccessRead)
def grant_access(
    payload: GrantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    access = ModuleAccess(
        user_id=payload.user_id,
        module_id=payload.module_id,
        status="approved",
        granted_by=current_user.id,
        decided_at=datetime.utcnow(),
        decided_by=current_user.id,
    )
    db.add(access)
    db.commit()
    db.refresh(access)
    return _serialize(access)


@router.get("/pending", response_model=list[ModuleAccessRead])
def list_pending(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    rows = db.query(ModuleAccess).filter(
        ModuleAccess.status == "pending").all()
    return [_serialize(access) for access in rows]


@router.post("/{access_id}/approve", response_model=ModuleAccessRead)
def approve_request(
    access_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    access = db.query(ModuleAccess).filter(
        ModuleAccess.id == access_id).first()
    if not access:
        raise HTTPException(status_code=404, detail="Request not found")
    access.status = "approved"
    access.decided_at = datetime.utcnow()
    access.decided_by = current_user.id
    db.commit()
    db.refresh(access)
    return _serialize(access)


@router.post("/{access_id}/reject", response_model=ModuleAccessRead)
def reject_request(
    access_id: int,
    payload: DecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    access = db.query(ModuleAccess).filter(
        ModuleAccess.id == access_id).first()
    if not access:
        raise HTTPException(status_code=404, detail="Request not found")
    access.status = "rejected"
    access.rejection_reason = payload.rejection_reason
    access.decided_at = datetime.utcnow()
    access.decided_by = current_user.id
    db.commit()
    db.refresh(access)
    return _serialize(access)


@router.post("/{access_id}/revoke", response_model=ModuleAccessRead)
def revoke_access(
    access_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    access = db.query(ModuleAccess).filter(
        ModuleAccess.id == access_id).first()
    if not access:
        raise HTTPException(status_code=404, detail="Request not found")
    if access.status != "approved":
        raise HTTPException(
            status_code=400, detail="Only approved access can be revoked")

    target_visible = visible_to_admin(db.query(User).filter(
        User.id == access.user_id), current_user).first()
    if not target_visible:
        raise HTTPException(status_code=404, detail="Request not found")

    access.status = "revoked"
    access.decided_at = datetime.utcnow()
    access.decided_by = current_user.id
    db.commit()
    db.refresh(access)
    return _serialize(access)
