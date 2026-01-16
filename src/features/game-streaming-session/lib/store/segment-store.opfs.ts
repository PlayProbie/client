export async function getOpfsSessionDir(
  sessionId: string
): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  const base = await root.getDirectoryHandle('segment-store', {
    create: true,
  });
  return base.getDirectoryHandle(sessionId, { create: true });
}
