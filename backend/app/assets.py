from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Session, Mapped, mapped_column, relationship
from pydantic import BaseModel
from app.db.base import Base
from app.db.session import get_db
from app.core.deps import require_module_access, require_superadmin
from app.core.module_log import log_module_action
from app.models import User, Department

router = APIRouter(prefix="/assets", tags=["assets"])

VALID_STATUSES = {"in_use", "in_storage", "under_repair", "disposed", "to_be_announced"}


class AssetCategory(Base):
    __tablename__ = "asset_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=datetime.utcnow)


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tag_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("asset_categories.id"), nullable=False)
    serial_code: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="in_storage")
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    assigned_person_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_department_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("departments.id"), nullable=True)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    category: Mapped[AssetCategory] = relationship("AssetCategory", foreign_keys=[category_id])
    assigned_person: Mapped[User | None] = relationship("User", foreign_keys=[assigned_person_id])
    assigned_department: Mapped[Department | None] = relationship("Department", foreign_keys=[assigned_department_id])
    notes: Mapped[list["AssetNote"]] = relationship(
        "AssetNote", back_populates="asset", cascade="all, delete-orphan", order_by="AssetNote.created_at.desc()"
    )


class AssetNote(Base):
    __tablename__ = "asset_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    asset_id: Mapped[int] = mapped_column(Integer, ForeignKey("assets.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    edited: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    author: Mapped[User] = relationship("User", foreign_keys=[author_id])
    asset: Mapped[Asset] = relationship("Asset", back_populates="notes", foreign_keys=[asset_id])


def require_asset_admin(user: User = Depends(require_module_access("asset-tagging"))) -> User:
    if user.role not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required within Asset Tagging")
    return user


class AssetCategoryCreate(BaseModel):
    name: str


class AssetCategoryRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class AssetNoteCreate(BaseModel):
    content: str


class AssetNoteUpdate(BaseModel):
    content: str


class AssetNoteRead(BaseModel):
    id: int
    content: str
    author_id: int
    author_name: str
    created_at: datetime | None
    updated_at: datetime | None
    edited: bool


class AssetCreate(BaseModel):
    name: str
    category_id: int
    serial_code: str
    status: str = "in_storage"
    location: str | None = None
    assigned_person_id: int | None = None
    assigned_department_id: int | None = None


class AssetUpdate(BaseModel):
    name: str | None = None
    category_id: int | None = None
    serial_code: str | None = None
    status: str | None = None
    location: str | None = None
    assigned_person_id: int | None = None
    assigned_department_id: int | None = None


class AssetRead(BaseModel):
    id: int
    tag_id: str
    name: str
    category_id: int
    category_name: str
    serial_code: str
    status: str
    location: str | None
    assigned_person_id: int | None
    assigned_person_name: str | None
    assigned_department_id: int | None
    assigned_department_name: str | None
    created_at: datetime | None
    updated_at: datetime | None


class AssetDetailRead(AssetRead):
    notes: list[AssetNoteRead]


def _serialize_asset(asset: Asset) -> AssetRead:
    return AssetRead(
        id=asset.id,
        tag_id=asset.tag_id,
        name=asset.name,
        category_id=asset.category_id,
        category_name=asset.category.name,
        serial_code=asset.serial_code,
        status=asset.status,
        location=asset.location,
        assigned_person_id=asset.assigned_person_id,
        assigned_person_name=asset.assigned_person.name if asset.assigned_person else None,
        assigned_department_id=asset.assigned_department_id,
        assigned_department_name=asset.assigned_department.name if asset.assigned_department else None,
        created_at=asset.created_at,
        updated_at=asset.updated_at,
    )


def _serialize_note(note: AssetNote) -> AssetNoteRead:
    return AssetNoteRead(
        id=note.id,
        content=note.content,
        author_id=note.author_id,
        author_name=note.author.name,
        created_at=note.created_at,
        updated_at=note.updated_at,
        edited=note.edited,
    )


def _check_serial_unique(db: Session, serial_code: str, exclude_id: int | None = None) -> None:
    query = db.query(Asset).filter(Asset.serial_code == serial_code)
    if exclude_id:
        query = query.filter(Asset.id != exclude_id)
    existing = query.first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail={
                "message": f"This serial code is already used by {existing.name} ({existing.tag_id}).",
                "conflicting_asset_id": existing.id,
                "conflicting_asset_tag_id": existing.tag_id,
            },
        )


@router.get("/categories", response_model=list[AssetCategoryRead])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("asset-tagging")),
):
    return db.query(AssetCategory).order_by(AssetCategory.name).all()


@router.post("/categories", response_model=AssetCategoryRead)
def create_category(
    payload: AssetCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    existing = db.query(AssetCategory).filter(AssetCategory.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    category = AssetCategory(name=payload.name, created_by=current_user.id)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    category = db.query(AssetCategory).filter(AssetCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    in_use = db.query(Asset).filter(Asset.category_id == category_id).first()
    if in_use:
        raise HTTPException(status_code=400, detail="Cannot remove a category that's still assigned to assets")
    db.delete(category)
    db.commit()
    return {"deleted": True}


@router.get("", response_model=list[AssetRead])
def list_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("asset-tagging")),
):
    assets = db.query(Asset).order_by(Asset.created_at.desc()).all()
    return [_serialize_asset(a) for a in assets]


@router.get("/{asset_id}", response_model=AssetDetailRead)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("asset-tagging")),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    base = _serialize_asset(asset)
    notes = [_serialize_note(n) for n in asset.notes]
    return AssetDetailRead(**base.model_dump(), notes=notes)


@router.post("", response_model=AssetRead)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_asset_admin),
):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    category = db.query(AssetCategory).filter(AssetCategory.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    _check_serial_unique(db, payload.serial_code)

    asset = Asset(
        tag_id="",
        name=payload.name,
        category_id=payload.category_id,
        serial_code=payload.serial_code,
        status=payload.status,
        location=payload.location,
        assigned_person_id=payload.assigned_person_id,
        assigned_department_id=payload.assigned_department_id,
        created_by=current_user.id,
    )
    db.add(asset)
    db.flush()
    asset.tag_id = f"AST-{asset.id:06d}"
    log_module_action(db, "asset-tagging", asset.name, "asset_created", current_user.id)
    db.commit()
    db.refresh(asset)
    return _serialize_asset(asset)


@router.patch("/{asset_id}", response_model=AssetRead)
def update_asset(
    asset_id: int,
    payload: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_asset_admin),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    if "category_id" in update_data:
        category = db.query(AssetCategory).filter(AssetCategory.id == update_data["category_id"]).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    if "serial_code" in update_data:
        _check_serial_unique(db, update_data["serial_code"], exclude_id=asset.id)

    for field, value in update_data.items():
        setattr(asset, field, value)

    log_module_action(db, "asset-tagging", asset.name, "asset_updated", current_user.id)
    db.commit()
    db.refresh(asset)
    return _serialize_asset(asset)


@router.post("/{asset_id}/notes", response_model=AssetNoteRead)
def add_note(
    asset_id: int,
    payload: AssetNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("asset-tagging")),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    note = AssetNote(asset_id=asset_id, content=payload.content, author_id=current_user.id)
    db.add(note)
    log_module_action(db, "asset-tagging", asset.name, "note_added", current_user.id, detail=payload.content)
    db.commit()
    db.refresh(note)
    return _serialize_note(note)


@router.patch("/notes/{note_id}", response_model=AssetNoteRead)
def edit_note(
    note_id: int,
    payload: AssetNoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("asset-tagging")),
):
    note = db.query(AssetNote).filter(AssetNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    is_owner = note.author_id == current_user.id
    is_admin_tier = current_user.role in ("admin", "superadmin")
    if not is_owner and not is_admin_tier:
        raise HTTPException(status_code=403, detail="You can only edit your own notes")

    old_content = note.content
    note.content = payload.content
    note.edited = True
    log_module_action(
        db,
        "asset-tagging",
        note.asset.name,
        "note_edited",
        current_user.id,
        detail=f"From: {old_content}\nTo: {payload.content}",
    )
    db.commit()
    db.refresh(note)
    return _serialize_note(note)


@router.delete("/notes/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_asset_admin),
):
    note = db.query(AssetNote).filter(AssetNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    asset_name = note.asset.name
    content = note.content
    db.delete(note)
    log_module_action(db, "asset-tagging", asset_name, "note_deleted", current_user.id, detail=content)
    db.commit()
    return {"deleted": True}
