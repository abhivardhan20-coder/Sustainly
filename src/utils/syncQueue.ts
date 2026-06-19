import { openDB } from 'idb';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const DB_NAME = 'sustainly-sync';
const STORE_NAME = 'sync-queue';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function queueSync(data: any) {
  const db = await initDB();
  await db.put(STORE_NAME, { data, timestamp: Date.now() });
  
  if (navigator.onLine) {
    processSyncQueue();
  }
}

let isSyncing = false;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export async function processSyncQueue() {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  try {
    const user = auth.currentUser;
    if (!user) {
      isSyncing = false;
      return;
    }

    const database = await initDB();
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const items = await store.getAll();

    if (items.length > 0) {
      // Just sync the latest state, ignore intermediate states
      const latest = items[items.length - 1];
      const ref = doc(db, 'users', user.uid);
      await setDoc(ref, latest.data, { merge: true });

      // Clear queue
      await store.clear();
    }
  } catch (error) {
    console.error('Background sync failed', error);
  } finally {
    isSyncing = false;
  }
}

export function debouncedSync(data: any) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    queueSync(data);
  }, 2000); // 2 second debounce
}

// Listen to online events to trigger sync when reconnected
if (typeof window !== 'undefined') {
  window.addEventListener('online', processSyncQueue);
}
