import { describe, it, expect } from 'vitest'
import { authApi, userApi, walletApi } from '../src/utils/api'

describe('auth and wallet flows', () => {
  it('signup and signin flow with wallet creation', async () => {
    const email = 'flow@example.com';
    const password = 'password';
    const name = 'Flow User';

    const signup = await authApi.signUp(email, password, name);
    expect(signup.success).toBeTruthy();
    expect(signup.user).toBeDefined();
    const userId = signup.user.id;

    // wallet should exist
    const walletResp = await walletApi.getWallet(userId);
    expect(walletResp.wallet).toBeDefined();
    expect(typeof walletResp.wallet.credits).toBe('number');

    // sign in
    const signin = await authApi.signIn(email, password);
    expect(signin.success).toBeTruthy();
    expect(signin.user.id).toBe(userId);
  })

  it('wallet update and transactions', async () => {
    const email = 'wallet@example.com';
    const password = 'pw';
    const name = 'Wallet User';
    const signup = await authApi.signUp(email, password, name);
    const userId = signup.user.id;

    const before = await walletApi.getWallet(userId);
    const beforeCredits = before.wallet.credits;

    const addResp = await walletApi.updateBalance(userId, 'credits', 10, 'add', 'test add');
    expect(addResp.wallet.credits).toBe(beforeCredits + 10);

    const txs = await walletApi.getTransactions(userId);
    expect(Array.isArray(txs.transactions)).toBe(true);
    expect(txs.transactions.some(tx => tx.description === 'test add')).toBe(true);
  })
})
