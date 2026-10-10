const DB_NAME = 'healthconnect-records';
const STORE_NAME = 'attachments';
export const MAX_RECORD_FILE_BYTES = 10 * 1024 * 1024;

const allowedTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

export function validateRecordAttachment(file: Pick<File, 'name' | 'size' | 'type'> | null | undefined): string | null {
  if (!file) return 'Choose a PDF, JPG, or PNG file to attach.';
  if (file.size === 0) return 'The selected file is empty.';
  if (file.size > MAX_RECORD_FILE_BYTES) return 'Choose a file smaller than 10 MB.';
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const expectedType = allowedTypes[extension];
  if (!expectedType || file.type !== expectedType) {
    return 'Use a matching PDF, JPG, or PNG file.';
  }
  return null;
}

function openAttachmentDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser does not support local document storage.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Could not open local document storage.'));
  });
}

export async function saveDemoRecordAttachment(key: string, file: File): Promise<void> {
  const database = await openAttachmentDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(file, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('The document could not be saved in this browser.'));
    transaction.onabort = () => reject(new Error('The document could not be saved in this browser.'));
  }).finally(() => database.close());
}

export async function readDemoRecordAttachment(key: string): Promise<Blob | null> {
  const database = await openAttachmentDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => reject(new Error('The saved document could not be read.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(new Error('The saved document could not be read.'));
    };
  });
}
