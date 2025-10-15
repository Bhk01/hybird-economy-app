import { describe, it, expect } from 'vitest'
import { userApi, UserProfile, getLocalStorageItem } from '../src/utils/api'

describe('userApi reset and update', () => {
  it('resetProfile should clear related items and write a blank profile', async () => {
    // Arrange: create auth and user and some associated items
    const userId = 'test-user-1';
    const email = 'test@example.com';
    // simulate auth and profile
    localStorage.setItem('work_invest_mock_auth:' + email, JSON.stringify({ id: userId, email, password: 'pw' }));
    localStorage.setItem('work_invest_mock_user:' + userId, JSON.stringify({ id: userId, name: 'Test', email, bio: 'hi', portfolio: [{ id: 'p1', title: 'Demo' }] }));
    localStorage.setItem('work_invest_mock_job:job1', JSON.stringify({ id: 'job1', employerId: userId }));
    localStorage.setItem('work_invest_mock_skill:skill1', JSON.stringify({ id: 'skill1', offeredBy: userId }));

    // Act
    const res = await userApi.resetProfile(userId);

    // Assert
    expect(res.success).toBeTruthy();
    expect(res.profile).toBeDefined();
    // auth and related items should be removed
    expect(localStorage.getItem('work_invest_mock_job:job1')).toBeNull();
    expect(localStorage.getItem('work_invest_mock_skill:skill1')).toBeNull();
    // user record should exist but be blanked
    const profileRaw = localStorage.getItem('work_invest_mock_user:' + userId);
    expect(profileRaw).not.toBeNull();
    const profile = JSON.parse(profileRaw as string) as UserProfile;
    expect(profile.name).toBe('');
    expect(profile.portfolio).toEqual([]);
  })

  it('updateProfile should update stored profile fields', async () => {
    const userId = 'test-user-2';
    const email = 'update@example.com';
    localStorage.setItem('work_invest_mock_auth:' + email, JSON.stringify({ id: userId, email, password: 'pw' }));
    localStorage.setItem('work_invest_mock_user:' + userId, JSON.stringify({ id: userId, name: 'Before', email }));

    const updated = await userApi.updateProfile(userId, { name: 'After', portfolio: [{ id: 'p2', title: 'New' }] });
    expect(updated.success).toBeTruthy();
    expect(updated.profile).toBeDefined();
    expect(updated.profile.name).toBe('After');
    expect(updated.profile.portfolio && updated.profile.portfolio.length).toBe(1);
  })
})
