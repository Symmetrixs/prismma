from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db.session import get_db
from app.core.deps import get_current_user, require_admin, require_superadmin
from app.core.security import hash_password
from app.models import User, RoleChangeHistory

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


class UserCreateByAdmin(BaseModel):
    name: str
    email: EmailStr
    password: str
    employee_id: str
    phone_number: str | None = None
    department_id: int | None = None
    job_title: str | None = None
    profile_picture_url: str | None = None


class UserSelfUpdate(BaseModel):
    name: str | None = None
    phone_number: str | None = None
    department_id: int | None = None
    job_title: str | None = None
    profile_picture_url: str | None = None


class AdminUserUpdate(BaseModel):
    name: str | None = None
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


def visible_to_admin(query, current_user: User):
    if current_user.role == "admin":
        return query.filter(User.role == "staff")
    return query


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


@router.get("/pending-registrations", response_model=list[UserRead])
def pending_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = db.query(User).filter(User.account_status == "pending")
    query = visible_to_admin(query, current_user)
    return query.all()


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

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        employee_id=payload.employee_id,
        phone_number=payload.phone_number,
        department_id=payload.department_id,
        job_title=payload.job_title,
        role="staff",
        account_status="active",
        created_by=current_user.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
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

    for field, value in payload.model_dump(exclude_unset=True).items():
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

    user.account_status = "disabled"
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/enable", response_model=UserRead)
def enable_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = visible_to_admin(db.query(User), current_user)
    user = query.filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.account_status = "active"
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
