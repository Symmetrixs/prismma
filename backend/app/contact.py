from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from app.core.config import settings

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    message: str
    subject: str | None = None
    freight_type: str | None = None
    origin: str | None = None
    destination: str | None = None
    cargo_details: str | None = None
    position: str | None = None


def _build_body(payload: ContactRequest) -> str:
    lines = [
        f"Name: {payload.name}",
        f"Email: {payload.email}",
        f"Phone: {payload.phone or 'N/A'}",
    ]
    if payload.freight_type:
        lines.append(f"Freight type: {payload.freight_type}")
    if payload.origin:
        lines.append(f"Origin: {payload.origin}")
    if payload.destination:
        lines.append(f"Destination: {payload.destination}")
    if payload.cargo_details:
        lines.append(f"Cargo details: {payload.cargo_details}")
    if payload.position:
        lines.append(f"Position of interest: {payload.position}")
    lines.append("")
    lines.append(payload.message)
    return "\n".join(lines)


@router.post("")
def submit_contact(payload: ContactRequest):
    if not settings.SMTP_HOST or not settings.HR_EMAIL:
        raise HTTPException(status_code=503, detail="Mail service not configured")

    subject = payload.subject or f"New Contact Form Submission from {payload.name}"
    body = _build_body(payload)
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_USER
    msg["To"] = settings.HR_EMAIL

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to send message")

    return {"sent": True}
