/// <reference types="vitest" />
import { expect, test, describe } from 'vitest';
import * as api from '../src/utils/api';

describe('auth logout vs deleteAccount', () => {
  test('logout does not remove profile or wallet', async () => {
    const email = `logout+${Date.now()}@example.test`;
    const signup = await api.authApi.signUp(email, 'pass', 'LogoutUser') as any;
    const userId = signup.user.id;

    // ensure profile and wallet exist
    const profileBefore = (await api.userApi.getProfile(userId)) as any;
    expect(profileBefore.profile).toBeDefined();
    const walletBefore = (await api.walletApi.getWallet(userId)) as any;
    expect(walletBefore.wallet).toBeDefined();

    // logout
    const out = api.authApi.logout(userId) as any;
    expect(out.success).toBe(true);

    // profile/wallet should still exist
    const profileAfter = (await api.userApi.getProfile(userId)) as any;
    expect(profileAfter.profile).toBeDefined();
    const walletAfter = (await api.walletApi.getWallet(userId)) as any;
    expect(walletAfter.wallet).toBeDefined();
  });

  test('deleteAccount removes profile and related items', async () => {
    const email = `delacc+${Date.now()}@example.test`;
    const signup = await api.authApi.signUp(email, 'pass', 'DeleteUser') as any;
    const userId = signup.user.id;

    // create job and project for this user
    await api.jobsApi.createJob({ title: 'JobToDelete', employerId: userId });
    await api.projectsApi.createProject({ title: 'ProjectToDelete', ownerId: userId, fundingGoal: 10 });

    // confirm they exist
    const jobsBefore = api.mockBackend.getAllItems('job:').filter((j:any) => j.employerId === userId);
    expect(jobsBefore.length).toBeGreaterThanOrEqual(1);

    // delete account
    const res = await api.userApi.deleteAccount(userId) as any;
    expect(res.success).toBe(true);

    // profile should be gone from the mock backend storage
    const usersAfter = api.mockBackend.getAllItems('user:').filter((u:any) => u.id === userId || u.email === email);
    expect(usersAfter.length).toBe(0);

    // jobs/projects should no longer exist
    const jobsAfter = api.mockBackend.getAllItems('job:').filter((j:any) => j.employerId === userId);
    expect(jobsAfter.length).toBe(0);
  });
});