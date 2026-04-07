import { describe, expect, it } from 'vitest';
import { applyEntityChange, EMPTY_DATA } from '../services/dataState';

describe('dataState service', () => {
  it('prepends created items and avoids duplicates', () => {
    const base = {
      ...EMPTY_DATA,
      tasks: [{ id: '1', title: 'older', createdAt: '2024-01-01T00:00:00.000Z' }],
    };

    const created = applyEntityChange(base, 'tasks', 'create', {
      id: '2',
      title: 'newer',
      createdAt: '2024-01-02T00:00:00.000Z',
    });
    const deduped = applyEntityChange(created, 'task', 'create', {
      id: '2',
      title: 'newer',
      createdAt: '2024-01-02T00:00:00.000Z',
    });

    expect(created.tasks.map((task) => task.id)).toEqual(['2', '1']);
    expect(deduped.tasks).toHaveLength(2);
  });

  it('merges updates and keeps sort order stable', () => {
    const base = {
      ...EMPTY_DATA,
      plans: [
        { id: '1', title: 'plan', progress: '创意', createdAt: '2024-01-01T00:00:00.000Z' },
      ],
    };

    const updated = applyEntityChange(base, 'plan', 'update', {
      id: '1',
      progress: '发布',
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    expect(updated.plans[0]).toMatchObject({
      id: '1',
      title: 'plan',
      progress: '发布',
    });
  });

  it('preserves original createdAt when an update omits it', () => {
    const base = {
      ...EMPTY_DATA,
      tasks: [
        { id: '1', title: 'task', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
      ],
    };

    const updated = applyEntityChange(base, 'task', 'update', {
      id: '1',
      completed: true,
    });

    expect(updated.tasks[0]).toMatchObject({
      id: '1',
      completed: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('deletes entities by id', () => {
    const base = {
      ...EMPTY_DATA,
      inspirations: [{ id: '1', content: 'idea', createdAt: '2024-01-01T00:00:00.000Z' }],
    };

    const updated = applyEntityChange(base, 'inspiration', 'delete', { id: '1' });

    expect(updated.inspirations).toEqual([]);
  });
});
