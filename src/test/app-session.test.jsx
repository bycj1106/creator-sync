import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

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
  },
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('app session behavior', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    window.history.pushState({}, '', '/profile');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ plans: [], tasks: [], inspirations: [] }),
    });
  });

  it('keeps offline local data when a cloud user logs out', async () => {
    mockLocalStorage.setItem('token', 'cloud-token');
    mockLocalStorage.setItem('user', JSON.stringify({ id: 1, username: 'cloud-user' }));
    mockLocalStorage.setItem('creatorsync_local_user', JSON.stringify({
      id: 'local_1',
      username: '本地用户',
      type: 'local',
    }));
    mockLocalStorage.setItem('creatorsync_local_data', JSON.stringify({
      plans: [{ id: 'plan-1' }],
      tasks: [],
      inspirations: [],
    }));

    render(<App />);

    expect(await screen.findByRole('heading', { name: '我的' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('退出登录'));
    expect(await screen.findByText('确认退出登录')).toBeInTheDocument();

    const logoutButtons = screen.getAllByRole('button', { name: '退出登录' });
    fireEvent.click(logoutButtons[logoutButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument();
    });

    expect(mockLocalStorage.getItem('token')).toBeNull();
    expect(mockLocalStorage.getItem('user')).toBeNull();
    expect(mockLocalStorage.getItem('creatorsync_local_user')).not.toBeNull();
    expect(JSON.parse(mockLocalStorage.getItem('creatorsync_local_data'))).toMatchObject({
      plans: [{ id: 'plan-1' }],
    });
  });
});
