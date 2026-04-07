import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('localStorage service', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.resetModules();
  });

  it('normalizes malformed local data into safe array buckets', async () => {
    mockLocalStorage.setItem('creatorsync_local_data', JSON.stringify({
      plans: {},
      tasks: null,
      inspirations: 'bad',
    }));

    const { localStorageService } = await import('../services/localStorage');

    expect(localStorageService.getLocalData()).toEqual({
      plans: [],
      tasks: [],
      inspirations: [],
    });
  });

  it('rejects imports without a valid local user', async () => {
    const { localStorageService } = await import('../services/localStorage');
    const result = localStorageService.importData(JSON.stringify({
      user: { username: 'missing-id' },
      data: { plans: [], tasks: [], inspirations: [] },
    }));

    expect(result).toEqual({
      success: false,
      message: '导入文件缺少有效的本地账号信息',
    });
  });

  it('imports valid backups and normalizes broken collections', async () => {
    const { localStorageService } = await import('../services/localStorage');
    const result = localStorageService.importData(JSON.stringify({
      user: { id: 'local_1', username: '本地用户', type: 'local' },
      data: { plans: null, tasks: [{ id: '1' }], inspirations: {} },
    }));

    expect(result.success).toBe(true);
    expect(localStorageService.getLocalUser()).toMatchObject({ id: 'local_1', username: '本地用户' });
    expect(localStorageService.getLocalData()).toEqual({
      plans: [],
      tasks: [{
        id: '1',
        title: '',
        category: 'core',
        completed: false,
        createdAt: '',
        updatedAt: '',
      }],
      inspirations: [],
    });
  });

  it('drops malformed entities while keeping valid local records', async () => {
    const { localStorageService } = await import('../services/localStorage');
    const result = localStorageService.importData(JSON.stringify({
      user: { id: 'local_2', username: '本地用户', type: 'local' },
      data: {
        plans: [{ id: 'plan-1', title: 'ok' }, { title: 'missing-id' }],
        tasks: [{ id: 'task-1', completed: 'yes' }],
        inspirations: [{ id: 'idea-1', tags: 'bad' }, null],
      },
    }));

    expect(result.success).toBe(true);
    expect(localStorageService.getLocalData()).toEqual({
      plans: [{
        id: 'plan-1',
        title: 'ok',
        startDate: '',
        endDate: '',
        progress: '创意',
        status: 'pending',
        platforms: [],
        createdAt: '',
        updatedAt: '',
      }],
      tasks: [{
        id: 'task-1',
        title: '',
        category: 'core',
        completed: true,
        createdAt: '',
        updatedAt: '',
      }],
      inspirations: [{
        id: 'idea-1',
        content: '',
        tags: [],
        pinned: false,
        createdAt: '',
        updatedAt: '',
      }],
    });
  });
});
