import uuid
from supabase import create_client, Client
from app.core.config import settings

MAX_FILE_SIZE = 2 * 1024 * 1024

_SIGNATURES: dict[str, tuple[bytes, int]] = {
    "jpg": (b"\xff\xd8\xff", 0),
    "png": (b"\x89PNG\r\n\x1a\n", 0),
    "mp4": (b"ftyp", 4),
}


def detect_file_type(content: bytes) -> str | None:
    for ext, (signature, offset) in _SIGNATURES.items():
        if content[offset:offset + len(signature)] == signature:
            return ext

    if content[0:4] == b"RIFF" and content[8:12] == b"WEBP":
        return "webp"

    return None


def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def upload_file(bucket: str, content: bytes, extension: str) -> str:
    filename = f"{uuid.uuid4().hex}.{extension}"
    client = get_supabase_client()

    content_types = {
        "jpg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "mp4": "video/mp4",
    }

    client.storage.from_(bucket).upload(
        filename,
        content,
        {"content-type": content_types[extension]},
    )

    return client.storage.from_(bucket).get_public_url(filename)
