import boto3
from botocore.exceptions import ClientError

s3_client = boto3.client("s3")


def read_s3_object(bucket_name: str, storage_key: str) -> bytes:
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=storage_key)
        return response["Body"].read()
    except ClientError as exc:
        raise RuntimeError(
            f"Failed to read S3 object. bucket={bucket_name}, key={storage_key}, error={str(exc)}"
        ) from exc