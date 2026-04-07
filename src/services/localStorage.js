import { applyEntityChange, EMPTY_DATA } from './dataState';

const LOCAL_STORAGE_KEY = 'creatorsync_local_data';
const LOCAL_USER_KEY = 'creatorsync_local_user';

function safeParse(rawValue, fallback) {
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

function normalizeCollection(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeLocalUser(user) {
  if (!user || typeof user !== 'object') {
    return null;
  }

  const id = typeof user.id === 'string' ? user.id : '';
  const username = typeof user.username === 'string' ? user.username.trim() : '';

  if (!id || !username) {
    return null;
  }

  return {
    id,
    username,
    type: 'local',
    createdAt: typeof user.createdAt === 'string' ? user.createdAt : new Date().toISOString(),
  };
}

// Storage can contain stale or user-edited JSON. Normalize it into the minimum
// shape every page expects before any component reads from it.
function normalizePlan(plan) {
  if (!plan || typeof plan !== 'object' || typeof plan.id !== 'string') {
    return null;
  }

  return {
    ...plan,
    title: typeof plan.title === 'string' ? plan.title : '',
    startDate: typeof plan.startDate === 'string' ? plan.startDate : '',
    endDate: typeof plan.endDate === 'string' ? plan.endDate : '',
    progress: typeof plan.progress === 'string' ? plan.progress : '创意',
    status: typeof plan.status === 'string' ? plan.status : 'pending',
    platforms: Array.isArray(plan.platforms) ? plan.platforms : [],
    createdAt: typeof plan.createdAt === 'string' ? plan.createdAt : '',
    updatedAt: typeof plan.updatedAt === 'string' ? plan.updatedAt : '',
  };
}

function normalizeTask(task) {
  if (!task || typeof task !== 'object' || typeof task.id !== 'string') {
    return null;
  }

  return {
    ...task,
    title: typeof task.title === 'string' ? task.title : '',
    category: typeof task.category === 'string' ? task.category : 'core',
    completed: Boolean(task.completed),
    createdAt: typeof task.createdAt === 'string' ? task.createdAt : '',
    updatedAt: typeof task.updatedAt === 'string' ? task.updatedAt : '',
  };
}

function normalizeInspiration(inspiration) {
  if (!inspiration || typeof inspiration !== 'object' || typeof inspiration.id !== 'string') {
    return null;
  }

  return {
    ...inspiration,
    content: typeof inspiration.content === 'string' ? inspiration.content : '',
    tags: Array.isArray(inspiration.tags) ? inspiration.tags : [],
    pinned: Boolean(inspiration.pinned),
    createdAt: typeof inspiration.createdAt === 'string' ? inspiration.createdAt : '',
    updatedAt: typeof inspiration.updatedAt === 'string' ? inspiration.updatedAt : '',
  };
}

function normalizeLocalData(data) {
  if (!data || typeof data !== 'object') {
    return { ...EMPTY_DATA };
  }

  return {
    plans: normalizeCollection(data.plans).map(normalizePlan).filter(Boolean),
    tasks: normalizeCollection(data.tasks).map(normalizeTask).filter(Boolean),
    inspirations: normalizeCollection(data.inspirations).map(normalizeInspiration).filter(Boolean),
  };
}

export const localStorageService = {
  saveLocalUser: (username) => {
    const user = {
      id: `local_${Date.now()}`,
      username,
      type: 'local',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(EMPTY_DATA));
    return user;
  },

  getLocalUser: () => normalizeLocalUser(safeParse(localStorage.getItem(LOCAL_USER_KEY), null)),

  getLocalData: () => normalizeLocalData(safeParse(localStorage.getItem(LOCAL_STORAGE_KEY), EMPTY_DATA)),

  saveLocalData: (data) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizeLocalData(data)));
  },

  updateLocalData: (type, action, item) => {
    const nextData = applyEntityChange(localStorageService.getLocalData(), type, action, item);
    localStorageService.saveLocalData(nextData);
    return nextData;
  },

  exportData: () => {
    const user = localStorageService.getLocalUser();
    const data = localStorageService.getLocalData();
    return JSON.stringify({ user, data }, null, 2);
  },

  importData: (jsonString) => {
    try {
      const { user, data } = JSON.parse(jsonString);
      const normalizedUser = normalizeLocalUser(user);
      if (!normalizedUser) {
        return { success: false, message: '导入文件缺少有效的本地账号信息' };
      }

      const normalizedData = normalizeLocalData(data);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(normalizedUser));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizedData));
      return { success: true, message: '数据导入成功，将使用新数据重新登录' };
    } catch {
      return { success: false, message: '导入文件格式不正确' };
    }
  },

  clearLocalUser: () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
};
