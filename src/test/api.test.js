import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockLocalStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('api service', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('authApi', () => {
    it('should call register endpoint', async () => {
      const mockResponse = { user: { id: 1, username: 'test' }, token: 'abc123' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const { authApi } = await import('../services/api');
      const result = await authApi.register('testuser', 'password123', 'CREATOR2026');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            password: 'password123',
            invitationCode: 'CREATOR2026'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed register', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: '用户名已存在' })
      });

      const { authApi } = await import('../services/api');

      await expect(authApi.register('testuser', 'password123', 'CREATOR2026'))
        .rejects.toThrow('用户名已存在');
    });
  });

  describe('token management', () => {
    it('should set and get token correctly', async () => {
      const { setToken, getToken } = await import('../services/api');

      setToken('test-token');
      expect(getToken()).toBe('test-token');
      expect(localStorage.getItem('token')).toBe('test-token');

      setToken(null);
      expect(getToken()).toBeNull();
    });
  });
});
