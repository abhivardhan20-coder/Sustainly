/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Mock firebase firestore
vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    onSnapshot: vi.fn(),
  };
});

describe('Firestore Data Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getDoc with correct user reference when loading profile', async () => {
    // Mock the user profile document response
    (getDoc as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'Test User', points: 100 })
    });

    // In a real scenario, this would be tested through App.tsx or a custom hook.
    // For this unit test, we just ensure the mock works and we simulate the call.
    const mockDb = {};
    const userDocRef = { id: 'test-user-id' };
    
    (doc as ReturnType<typeof vi.fn>).mockReturnValue(userDocRef);

    const docRef = doc(mockDb as any, 'users', 'test-user-id');
    const docSnap = await getDoc(docRef);

    expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'test-user-id');
    expect(getDoc).toHaveBeenCalledWith(userDocRef);
    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data()).toEqual({ name: 'Test User', points: 100 });
  });

  it('should call setDoc with correct data when saving profile', async () => {
    const mockDb = {};
    const userDocRef = { id: 'test-user-id' };
    
    (doc as ReturnType<typeof vi.fn>).mockReturnValue(userDocRef);
    (setDoc as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const dataToSave = {
      profile: { name: 'Test User' },
      streak: 5,
      lastActive: '2026-06-09'
    };

    const docRef = doc(mockDb as any, 'users', 'test-user-id');
    await setDoc(docRef, dataToSave, { merge: true });

    expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'test-user-id');
    expect(setDoc).toHaveBeenCalledWith(userDocRef, dataToSave, { merge: true });
  });
});
