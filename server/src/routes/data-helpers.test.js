// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  toInspirationResponse,
  toPlanRecord,
  toTaskResponse,
  validateInspirationInput,
  validatePlanInput,
  validateTaskInput,
} from './data-helpers.js';

describe('data route helpers', () => {
  it('validates array-based fields for plans and inspirations', () => {
    expect(validatePlanInput({ title: 'ok', platforms: 'bad' })).toContain('发布平台格式不正确');
    expect(validateInspirationInput({ content: 'idea', tags: 'bad' })).toContain('标签格式不正确');
  });

  it('rejects missing ids and invalid createdAt values', () => {
    expect(validatePlanInput({ id: '', title: 'ok' })).toContain('ID 不能为空');
    expect(validateTaskInput({ id: 'task-1', title: 'ok', createdAt: 'bad-date' })).toContain('创建时间格式不正确');
    expect(validateInspirationInput({ id: 'idea-1', content: 'ok', createdAt: 'bad-date' })).toContain('创建时间格式不正确');
  });

  it('normalizes plan records before persistence', () => {
    const record = toPlanRecord({
      id: 'plan-1',
      title: '  Demo  ',
      progress: '发布',
      platforms: ['Bilibili'],
      status: 'published',
    }, '2024-01-01T00:00:00.000Z');

    expect(record).toMatchObject({
      id: 'plan-1',
      title: 'Demo',
      progress: '发布',
      status: 'published',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    expect(record.platforms).toBe('["Bilibili"]');
  });

  it('converts stored values back into API responses', () => {
    expect(toTaskResponse({ id: '1', completed: 1 }).completed).toBe(true);
    expect(
      toInspirationResponse({ id: '1', pinned: 0, tags: '["热点"]' })
    ).toMatchObject({
      pinned: false,
      tags: ['热点'],
    });
  });
});
