from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.deps import get_current_user, require_module_access
from app.core.storage import detect_file_type, upload_file, MAX_FILE_SIZE
from app.models import User

router = APIRouter(prefix="/uploads", tags=["uploads"])


async def _validate_and_upload(file: UploadFile, bucket: str, allowed_types: set[str]) -> str:
    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds the 2MB limit")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    file_type = detect_file_type(content)
    if file_type is None or file_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type not recognized or not allowed. Accepted: {', '.join(sorted(allowed_types))}",
        )

    try:
        return upload_file(bucket, content, file_type)
    except Exception:
        raise HTTPException(status_code=502, detail="Upload to storage failed, please try again")


@router.post("/news-media")
async def upload_news_media(
    file: UploadFile = File(...),
    current_user: User = Depends(require_module_access("news-editor")),
):
    url = await _validate_and_upload(file, "news-media", {"jpg", "png", "webp", "mp4"})
    return {"url": url}


@router.post("/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    url = await _validate_and_upload(file, "profile-pictures", {"jpg", "png", "webp"})
    return {"url": url}
