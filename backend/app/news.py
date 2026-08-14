import enum
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Session, Mapped, mapped_column, relationship
from pydantic import BaseModel
from app.db.base import Base
from app.db.session import get_db
from app.core.deps import require_module_access, get_optional_user
from app.core.utils import slugify
from app.models import User, Module, ModuleAccess


def _has_news_editor_access(user: User, db: Session) -> bool:
    module = db.query(Module).filter(Module.slug == "news-editor").first()
    if not module:
        return False
    return (
        db.query(ModuleAccess)
        .filter(
            ModuleAccess.user_id == user.id,
            ModuleAccess.module_id == module.id,
            ModuleAccess.status == "approved",
        )
        .first()
        is not None
    )


def _generate_unique_slug(title: str, db: Session, exclude_id: int | None = None) -> str:
    base = slugify(title)
    slug = base
    counter = 2
    while True:
        query = db.query(News).filter(News.slug == slug)
        if exclude_id is not None:
            query = query.filter(News.id != exclude_id)
        if not query.first():
            return slug
        slug = f"{base}-{counter}"
        counter += 1


router = APIRouter(prefix="/news", tags=["news"])


class NewsCategory(str, enum.Enum):
    MALAYSIA = "malaysia"
    GLOBAL = "global"


class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"


class News(Base):
    __tablename__ = "news"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    excerpt: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[NewsCategory] = mapped_column(
        SAEnum(NewsCategory, values_callable=lambda x: [e.value for e in x]), nullable=False, index=True
    )
    published: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False, index=True)
    author_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    media: Mapped[list["NewsMedia"]] = relationship(
        "NewsMedia", cascade="all, delete-orphan", order_by="NewsMedia.order"
    )


class NewsMedia(Base):
    __tablename__ = "news_media"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    news_id: Mapped[int] = mapped_column(Integer, ForeignKey("news.id"), nullable=False)
    media_type: Mapped[MediaType] = mapped_column(
        SAEnum(MediaType, values_callable=lambda x: [e.value for e in x]), nullable=False
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class NewsMediaItem(BaseModel):
    media_type: MediaType
    url: str
    order: int = 0


class NewsMediaRead(NewsMediaItem):
    id: int

    class Config:
        from_attributes = True


class NewsCreate(BaseModel):
    title: str
    excerpt: str | None = None
    content: str
    category: NewsCategory
    published: bool = False
    media: list[NewsMediaItem] = []


class NewsUpdate(BaseModel):
    title: str | None = None
    excerpt: str | None = None
    content: str | None = None
    category: NewsCategory | None = None
    published: bool | None = None
    media: list[NewsMediaItem] | None = None


class NewsRead(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: str | None
    content: str
    category: NewsCategory
    published: bool
    created_at: datetime
    updated_at: datetime
    media: list[NewsMediaRead]

    class Config:
        from_attributes = True


@router.get("", response_model=list[NewsRead])
def list_news(
    category: NewsCategory | None = Query(default=None),
    published_only: bool = Query(default=True),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    can_see_drafts = current_user is not None and (
        current_user.role in ("admin", "superadmin")
        or _has_news_editor_access(current_user, db)
    )
    if not can_see_drafts:
        published_only = True

    query = db.query(News)
    if category:
        query = query.filter(News.category == category)
    if published_only:
        query = query.filter(News.published == True)
    return query.order_by(News.created_at.desc()).all()


@router.get("/{slug}", response_model=NewsRead)
def get_news_by_slug(slug: str, db: Session = Depends(get_db)):
    item = db.query(News).filter(News.slug == slug).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article not found")
    return item


@router.post("", response_model=NewsRead)
def create_news(
    payload: NewsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("news-editor")),
):
    data = payload.model_dump(exclude={"media"})
    data["slug"] = _generate_unique_slug(payload.title, db)
    item = News(**data)
    db.add(item)
    db.flush()

    for media_item in payload.media:
        db.add(NewsMedia(news_id=item.id, **media_item.model_dump()))

    db.commit()
    db.refresh(item)
    return item


@router.put("/{news_id}", response_model=NewsRead)
def update_news(
    news_id: int,
    payload: NewsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("news-editor")),
):
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article not found")

    update_data = payload.model_dump(exclude_unset=True, exclude={"media"})
    if "title" in update_data:
        update_data["slug"] = _generate_unique_slug(update_data["title"], db, exclude_id=item.id)

    for field, value in update_data.items():
        setattr(item, field, value)

    if payload.media is not None:
        db.query(NewsMedia).filter(NewsMedia.news_id == item.id).delete()
        for media_item in payload.media:
            db.add(NewsMedia(news_id=item.id, **media_item.model_dump()))

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{news_id}")
def delete_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("news-editor")),
):
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article not found")
    db.delete(item)
    db.commit()
    return {"deleted": True}
