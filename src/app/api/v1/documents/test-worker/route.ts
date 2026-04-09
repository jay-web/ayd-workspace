import { NextRequest, NextResponse } from "next/server";
import type { SQSEvent } from "aws-lambda";
import { handleDocumentIngestionEvent } from "@/modules/documents/document.ingestion.worker";

function encodeS3ObjectKey(key: string) {
  return encodeURIComponent(key).replace(/%20/g, "+");
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This test route is disabled in production." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const storageKey = body?.storageKey;

    if (!storageKey || typeof storageKey !== "string") {
      return NextResponse.json(
        { error: "storageKey is required." },
        { status: 400 }
      );
    }

    const fakeEvent: SQSEvent = {
      Records: [
        {
          messageId: crypto.randomUUID(),
          receiptHandle: "test-receipt-handle",
          body: JSON.stringify({
            Records: [
              {
                s3: {
                  object: {
                    key: encodeS3ObjectKey(storageKey),
                  },
                },
              },
            ],
          }),
          attributes: {
            ApproximateReceiveCount: "1",
            SentTimestamp: Date.now().toString(),
            SenderId: "test-sender",
            ApproximateFirstReceiveTimestamp: Date.now().toString(),
          },
          messageAttributes: {},
          md5OfBody: "test-md5",
          eventSource: "aws:sqs",
          eventSourceARN: "arn:aws:sqs:ap-south-1:123456789012:test-queue",
          awsRegion: "ap-south-1",
        },
      ],
    };

    await handleDocumentIngestionEvent(fakeEvent);

    return NextResponse.json({
      ok: true,
      message: "Worker executed successfully.",
      storageKey,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown worker test error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}