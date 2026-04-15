import json
import os


def lambda_handler(event, context):
    return {
        "ok": True,
        "worker": "ocr-results",
        "env": os.getenv("APP_ENV", "dev"),
        "message": "OCR results worker scaffold is alive.",
        "event_preview": json.dumps(event)[:500],
    }