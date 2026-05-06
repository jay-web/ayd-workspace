import clsx from "clsx";

export function cn(...inputs: any[]) {
  return clsx(inputs);
}

export function formatFileSize(sizeBytes?: number) {
    if (!sizeBytes || sizeBytes <= 0) {
        return "—";
    }

    if (sizeBytes < 1024) {
        return `${sizeBytes} B`;
    }

    if (sizeBytes < 1024 * 1024) {
        return `${(sizeBytes / 1024).toFixed(1)} KB`;
    }

    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}