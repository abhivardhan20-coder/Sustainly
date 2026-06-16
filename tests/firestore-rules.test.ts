import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { doc, getDoc, setDoc, setLogLevel } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

describe.skipIf(!process.env.FIREBASE_EMULATOR_HUB)('Firestore Security Rules', () => {
  beforeAll(async () => {
    // Silence noisy firebase loggers
    setLogLevel('error');
    
    testEnv = await initializeTestEnvironment({
      projectId: 'sustainly-test',
      firestore: {
        rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8'),
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('allows user to read and write their own profile', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const docRef = doc(alice.firestore(), 'users/alice');

    await assertSucceeds(setDoc(docRef, { name: 'Alice' }));
    await assertSucceeds(getDoc(docRef));
  });

  it('denies user to read or write other profiles', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const docRef = doc(alice.firestore(), 'users/bob');

    await assertFails(setDoc(docRef, { name: 'Bob by Alice' }));
    await assertFails(getDoc(docRef));
  });

  it('allows user to write to their own logs', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const docRef = doc(alice.firestore(), 'users/alice/logs/log1');

    await assertSucceeds(setDoc(docRef, { activity: 'Biking' }));
  });

  it('denies user to write to other logs', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const docRef = doc(alice.firestore(), 'users/bob/logs/log1');

    await assertFails(setDoc(docRef, { activity: 'Biking' }));
  });

  it('denies unauthenticated users from reading or writing', async () => {
    const unauth = testEnv.unauthenticatedContext();
    const docRef = doc(unauth.firestore(), 'users/alice');

    await assertFails(setDoc(docRef, { name: 'Hacker' }));
    await assertFails(getDoc(docRef));
  });
});
