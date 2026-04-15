import json
import os

def lambda_handler(event, context):
    print(json.dumps(event))

    return {
        "ok": True,
        "worker": "ingestion",
        "env": os.getenv("APP_ENV", "dev"),
        "message": "Ingestion worker scaffold is alive.",
    }