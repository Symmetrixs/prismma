from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db.session import get_db
from app.core.deps import get_current_user, require_admin, require_superadmin
from app.core.security import hash_password
from app.models import User, RoleChangeHistory, ModuleAccess, Module, Department, AccountActionLog

router = APIRouter(prefix="/users", tags=["users"])


class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    employee_id: str | None
    phone_number: str | None
    department_id: int | None
    job_title: str | None
    profile_picture_url: str | None
    role: str
    account_status: str
    rejection_reason: str | None
    is_blocked: bool
    account_locked: bool
    last_login_at: datetime | None

    class Config:
        from_attributes = True


class UserModuleAccessRead(BaseModel):
    id: int
    module_id: int
    module_name: str
    status: str
    rejection_reason: str | None
    requested_at: datetime | None
    decided_at: datetime | None


class UserDetailRead(UserRead):
    department_name: str | None
    module_access: list[UserModuleAccessRead]


class UserCreateByAdmin(BaseModel):
    name: str
    email: EmailStr
    password: str
    employee_id: str
    phone_number: str | None = None
    department_id: int | None = None
    job_title: str | None = None
    profile_picture_url: str | None = None
    role: str | None = None


class UserSelfUpdate(BaseModel):
    name: str | None = None
    phone_number: str | None = None
    department_id: int | None = None
    job_title: str | None = None
    profile_picture_url: str | None = None


class AdminUserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    department_id: int | None = None
    job_title: str | None = None
    employee_id: str | None = None


class RejectionPayload(BaseModel):
    reason: str


class RoleChangePayload(BaseModel):
    new_role: str


class BlockPayload(BaseModel):
    is_blocked: bool


class DepartmentAnalytics(BaseModel):
    department_id: int | None
    department_name: str
    total: int
    active: int
    pending: int
    disabled: int | None


def visible_to_admin(query, current_user: User):
    if current_user.role == "admin":
        return query.filter(User.role == "staff")
    return query


def _log_action(db: Session, target_user_id: int, action: str, performed_by: int, reason: str | None = None) -> None:
    db.add(AccountActionLog(
        target_user_id=target_user_id,
        action=action,
        reason=reason,
        performed_by=performed_by,
    ))


@router.get("/me", response_model=UserRead)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserRead)
def update_my_profile(
    payload: UserSelfUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = db.query(User)
    query = visible_to_admin(query, current_user)
    return query.order_by(User.created_at.desc()).all()


@router.get("/analytics", response_model=list[DepartmentAnalytics])
def user_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = db.query(User)
    query = visible_to_admin(query, current_user)
    users = query.all()

    departments = {d.id: d.name for d in db.query(Department).all()}
    buckets: dict[int | None, dict[str, int]] = {}

    for user in users:
        key = user.department_id
        if key not in buckets:
            buckets[key] = {"total": 0, "active": 0, "pending": 0, "disabled": 0}
        if user.account_status == "disabled":
            buckets[key]["disabled"] += 1
            if current_user.role == "superadmin":
                buckets[key]["total"] += 1
        else:
            buckets[key]["total"] += 1
            if user.account_status == "active":
                buckets[key]["active"] += 1
            elif user.account_status == "pending":
                buckets[key]["pending"] += 1

    result: list[DepartmentAnalytics] = []
    for department_id, counts in buckets.items():
        result.append(DepartmentAnalytics(
            department_id=department_id,
            department_name=departments.get(department_id, "Unassigned") if department_id else "Unassigned",
            total=counts["total"],
            active=counts["active"],
            pending=counts["pending"],
            disabled=counts["disabled"] if current_user.role == "superadmin" else None,
        ))

    result.sort(key=lambda d: d.department_name)
    return result


@router.get("/pending-registrations", response_model=list[UserRead])
def pending_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = db.query(User).filter(User.account_status == "pending")
    query = visible_to_admin(query, current_user)
    return query.all()


@router.get("/{user_id}", response_model=UserDetailRead)
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = visible_to_admin(db.query(User), current_user)
    user = query.filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    department_name = None
    if user.department_id:
        department = db.query(Department).filter(Department.id == user.department_id).first()
        department_name = department.name if department else None

    access_rows = (
        db.query(ModuleAccess, Module)
        .join(Module, ModuleAccess.module_id == Module.id)
        .filter(ModuleAccess.user_id == user_id)
        .order_by(ModuleAccess.requested_at.desc())
        .all()
    )

    module_access = [
        UserModuleAccessRead(
            id=access.id,
            module_id=access.module_id,
            module_name=module.name,
            status=access.status,
            rejection_reason=access.rejection_reason,
            requested_at=access.requested_at,
            decided_at=access.decided_at,
        )
        for access, module in access_rows
    ]

    return UserDetailRead(
        id=user.id,
        name=user.name,
        email=user.email,
        employee_id=user.employee_id,
        phone_number=user.phone_number,
        department_id=user.department_id,
        job_title=user.job_title,
        profile_picture_url=user.profile_picture_url,
        role=user.role,
        account_status=user.account_status,
        rejection_reason=user.rejection_reason,
        is_blocked=user.is_blocked,
        account_locked=user.account_locked,
        last_login_at=user.last_login_at,
        department_name=department_name,
        module_access=module_access,
    )


@router.post("", response_model=UserRead)
def create_user_by_admin(
    payload: UserCreateByAdmin,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    existing = db.query(User).filter(
        (User.email == payload.email) | (User.employee_id == payload.employee_id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email or employee ID already in use")

    role = "staff"
    if current_user.role == "superadmin" and payload.role:
        if payload.role not in ("staff", "admin", "superadmin"):
            raise HTTPException(status_code=400, detail="Invalid role")
        role = payload.role

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        employee_id=payload.employee_id,
        phone_number=payload.phone_number,
        department_id=payload.department_id,
        job_title=payload.job_title,
        role=role,
        account_status="active",
        created_by=current_user.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _log_action(db, user.id, "created", current_user.id)
    db.commit()
    return user


@router.post("/{user_id}/approve", response_model=UserRead)
def approve_registration(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = visible_to_admin(db.query(User), current_user)
    user = query.filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.account_status = "active"
    _log_action(db, user.id, "registration_approved", current_user.id)
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/reject", response_model=UserRead)
def reject_registration(
    user_id: int,
    payload: RejectionPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = visible_to_admin(db.query(User), current_user)
    user = query.filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.account_status = "rejected"
    user.rejection_reason = payload.reason
    _log_action(db, user.id, "registration_rejected", current_user.id, payload.reason)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = visible_to_admin(db.query(User), current_user)
    user = query.filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"]:
        conflict = db.query(User).filter(User.email == update_data["email"], User.id != user_id).first()
        if conflict:
            raise HTTPException(
                status_code=400,
                detail=f"This email is already used by {conflict.name}. Accounts are looked up by email at login, so two accounts can't share one.",
            )

    if "employee_id" in update_data and update_data["employee_id"]:
        conflict = db.query(User).filter(User.employee_id == update_data["employee_id"], User.id != user_id).first()
        if conflict:
            raise HTTPException(
                status_code=400,
                detail=f"This employee ID is already used by {conflict.name}.",
            )

    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/disable", response_model=UserRead)
def disable_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = visible_to_admin(db.query(User), current_user)
    user = query.filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "superadmin":
        remaining = db.query(User).filter(
            User.role == "superadmin",
            User.account_status == "active",
            User.id != user_id,
        ).count()
        if remaining == 0:
            raise HTTPException(status_code=400, detail="Cannot disable the last active superadmin")

    user.account_status = "disabled"
    _log_action(db, user.id, "disabled", current_user.id)
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/enable", response_model=UserRead)
def enable_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.account_status = "active"
    _log_action(db, user.id, "enabled", current_user.id)
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/unlock", response_model=UserRead)
def unlock_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = visible_to_admin(db.query(User), current_user)
    user = query.filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.account_locked = False
    user.locked_until = None
    user.lockout_stage = 0
    user.failed_login_count = 0
    _log_action(db, user.id, "unlocked", current_user.id)
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/block", response_model=UserRead)
def set_block_status(
    user_id: int,
    payload: BlockPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = visible_to_admin(db.query(User), current_user)
    user = query.filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_blocked = payload.is_blocked
    _log_action(db, user.id, "blocked" if payload.is_blocked else "unblocked", current_user.id)
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/role", response_model=UserRead)
def change_role(
    user_id: int,
    payload: RoleChangePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    if payload.new_role not in ("staff", "admin", "superadmin"):
        raise HTTPException(status_code=400, detail="Invalid role")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "superadmin" and payload.new_role != "superadmin":
        remaining = db.query(User).filter(User.role == "superadmin", User.id != user_id).count()
        if remaining == 0:
            raise HTTPException(status_code=400, detail="Cannot remove the last superadmin")

    old_role = user.role
    user.role = payload.new_role
    db.add(RoleChangeHistory(
        user_id=user.id,
        old_role=old_role,
        new_role=payload.new_role,
        changed_by=current_user.id,
    ))
    db.commit()
    db.refresh(user)
    return user
