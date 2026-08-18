from datetime import datetime
from sqlalchemy.orm import Session
from app.models import ModuleActionLog


def log_module_action(
    db: Session,
    module: str,
    target_label: str,
    action: str,
    performed_by: int,
    detail: str | None = None,
) -> None:
    db.add(ModuleActionLog(
        module=module,
        target_label=target_label,
        action=action,
        detail=detail,
        performed_by=performed_by,
    ))
