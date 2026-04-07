export function parseJSON(rawValue, fallback = null) {
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function validateBaseRecordInput(data) {
  const errors = [];

  if (!normalizeString(data?.id)) {
    errors.push('ID 不能为空');
  }

  if (data?.createdAt != null && !isValidIsoDate(data.createdAt)) {
    errors.push('创建时间格式不正确');
  }

  return errors;
}

export function validatePlanInput(data) {
  const errors = validateBaseRecordInput(data);
  const title = normalizeString(data?.title);

  if (!title) {
    errors.push('标题不能为空');
  }
  if (title.length > 200) {
    errors.push('标题不能超过200字符');
  }
  if (data?.platforms && !Array.isArray(data.platforms)) {
    errors.push('发布平台格式不正确');
  }

  return errors;
}

export function validateTaskInput(data) {
  const errors = validateBaseRecordInput(data);
  const title = normalizeString(data?.title);

  if (!title) {
    errors.push('标题不能为空');
  }
  if (title.length > 200) {
    errors.push('标题不能超过200字符');
  }

  return errors;
}

export function validateInspirationInput(data) {
  const errors = validateBaseRecordInput(data);
  const content = normalizeString(data?.content);

  if (!content) {
    errors.push('内容不能为空');
  }
  if (content.length > 5000) {
    errors.push('内容不能超过5000字符');
  }
  if (data?.tags && !Array.isArray(data.tags)) {
    errors.push('标签格式不正确');
  }

  return errors;
}

export function toPlanRecord(data, now = new Date().toISOString()) {
  return {
    id: data.id,
    title: normalizeString(data.title),
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    progress: data.progress || '创意',
    platforms: JSON.stringify(Array.isArray(data.platforms) ? data.platforms : []),
    status: data.status || 'pending',
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
}

export function toTaskRecord(data, now = new Date().toISOString()) {
  return {
    id: data.id,
    title: normalizeString(data.title),
    category: data.category || 'core',
    completed: data.completed ? 1 : 0,
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
}

export function toInspirationRecord(data, now = new Date().toISOString()) {
  return {
    id: data.id,
    content: normalizeString(data.content),
    tags: JSON.stringify(Array.isArray(data.tags) ? data.tags : []),
    pinned: data.pinned ? 1 : 0,
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
}

export function toPlanResponse(plan) {
  return {
    ...plan,
    platforms: parseJSON(plan.platforms, []),
  };
}

export function toTaskResponse(task) {
  return {
    ...task,
    completed: Boolean(task.completed),
  };
}

export function toInspirationResponse(inspiration) {
  return {
    ...inspiration,
    pinned: Boolean(inspiration.pinned),
    tags: parseJSON(inspiration.tags, []),
  };
}
