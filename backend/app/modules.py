from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.core.deps import get_current_user, require_superadmin
from app.core.utils import slugify
from app.models import Module, User

router = APIRouter(prefix="/modules", tags=["modules"])


class ModuleCreate(BaseModel):
    name: str
    description: str | None = None
    status: str = "coming_soon"


class ModuleStatusUpdate(BaseModel):
    status: str


class ModuleRead(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    status: str
    component_key: str

    class Config:
        from_attributes = True


def _unique_slug(name: str, db: Session) -> str:
    base = slugify(name)
    slug = base
    counter = 2
    while db.query(Module).filter(Module.slug == slug).first():
        slug = f"{base}-{counter}"
        counter += 1
    return slug


@router.get("", response_model=list[ModuleRead])
def list_modules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Module).order_by(Module.name).all()


@router.post("", response_model=ModuleRead)
def create_module(
    payload: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    slug = _unique_slug(payload.name, db)
    module = Module(
        name=payload.name,
        slug=slug,
        description=payload.description,
        status=payload.status,
        component_key=slug,
        created_by=current_user.id,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.patch("/{module_id}", response_model=ModuleRead)
def update_module_status(
    module_id: int,
    payload: ModuleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    if payload.status not in ("active", "coming_soon"):
        raise HTTPException(status_code=400, detail="Invalid status")
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    module.status = payload.status
    db.commit()
    db.refresh(module)
    return module


@router.delete("/{module_id}")
def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(module)
    db.commit()
    return {"deleted": True}
