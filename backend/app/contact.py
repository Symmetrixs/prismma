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


@router.post("")
def submit_contact(payload: ContactRequest):
    if not settings.SMTP_HOST or not settings.HR_EMAIL:
        raise HTTPException(status_code=503, detail="Mail service not configured")

    body = f"Name: {payload.name}\nEmail: {payload.email}\nPhone: {payload.phone or 'N/A'}\n\n{payload.message}"
    msg = MIMEText(body)
    msg["Subject"] = f"New Contact Form Submission from {payload.name}"
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
