import { describe, test, expect } from 'vitest';

/// <reference types="vitest" />
import * as api from '../src/utils/api';

describe('user profile flows', () => {
  test('signup creates profile and wallet', async () => {
    const email = `test+${Date.now()}@example.test`;
    const name = 'Test User';
    const password = 'Password123!';

    const signup = await api.authApi.signUp(email, password, name) as any;
    expect(signup.success).toBe(true);
    const userId = signup.user.id;

    const profileResp = await api.userApi.getProfile(userId) as any;
    expect(profileResp.profile).toBeDefined();

    const w = await api.walletApi.getWallet(userId) as any;
    expect(w.wallet).toBeDefined();
  });

  test('resetProfile clears associated artifacts', async () => {
    const email = `reset+${Date.now()}@example.test`;
    const name = 'Reset User';
    const password = 'Password123!';
    const signup = await api.authApi.signUp(email, password, name) as any;
    const userId = signup.user.id;

    // Create a job and project associated with this user
    await api.jobsApi.createJob({ title: 'Job', employerId: userId });
    await api.projectsApi.createProject({ title: 'Project', ownerId: userId, fundingGoal: 100 });

    const reset = await api.userApi.resetProfile(userId) as any;
    expect(reset.success).toBe(true);
    const profile = reset.profile;
    expect(profile.id).toBe(userId);

    // Check that jobs/projects referencing the user are removed
    const jobs = api.mockBackend.getAllItems('job:').filter((j: any) => j.employerId === userId || j.employerId === email);
    const projects = api.mockBackend.getAllItems('project:').filter((p: any) => p.ownerId === userId || p.ownerId === email);
    expect(jobs.length).toBe(0);
    expect(projects.length).toBe(0);
  });

  test('adding a review updates target rating', async () => {
    const emailA = `revA+${Date.now()}@example.test`;
    const emailB = `revB+${Date.now()}@example.test`;
    const signupA = await api.authApi.signUp(emailA, 'pass', 'A') as any;
    const signupB = await api.authApi.signUp(emailB, 'pass', 'B') as any;
    const idA = signupA.user.id;
    const idB = signupB.user.id;

    // B reviews A
    const add = await api.reviewsApi.addReview(idA, idB, 5, 'Great!') as any;
    expect(add.success).toBe(true);

    const profileResp = await api.userApi.getProfile(idA) as any;
    expect(profileResp.profile.rating).toBeGreaterThanOrEqual(4.9);
    expect(profileResp.profile.reviews.length).toBeGreaterThanOrEqual(1);
  });
});