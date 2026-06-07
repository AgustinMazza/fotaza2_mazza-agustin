export function blobABase64(blob) {
  if (!blob) return null;
  if (Buffer.isBuffer(blob)) return blob.toString("base64");
  if (blob?.type === "Buffer" && Array.isArray(blob.data))
    return Buffer.from(blob.data).toString("base64");
  return null;
}
