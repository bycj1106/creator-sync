const LOCAL_STORAGE_KEY = 'creatorsync_local_data';
const LOCAL_USER_KEY = 'creatorsync_local_user';

export const localStorageService = {
  saveLocalUser: (username) => {
    const user = {
      id: `local_${Date.now()}`,
      username,
      type: 'local',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      plans: [],
      tasks: [],
      inspirations: [],
    }));
    return user;
  },

  getLocalUser: () => {
    const userStr = localStorage.getItem(LOCAL_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  getLocalData: () => {
    const dataStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    return dataStr ? JSON.parse(dataStr) : { plans: [], tasks: [], inspirations: [] };
  },

  saveLocalData: (data) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  },

  updateLocalData: (type, action, item) => {
    const data = localStorageService.getLocalData();
    if (type === 'plans') {
      if (action === 'create') {
        data.plans.push(item);
      } else if (action === 'update') {
        data.plans = data.plans.map(p => p.id === item.id ? item : p);
      } else if (action === 'delete') {
        data.plans = data.plans.filter(p => p.id !== item.id);
      }
    } else if (type === 'tasks') {
      if (action === 'create') {
        data.tasks.push(item);
      } else if (action === 'update') {
        data.tasks = data.tasks.map(t => t.id === item.id ? item : t);
      } else if (action === 'delete') {
        data.tasks = data.tasks.filter(t => t.id !== item.id);
      }
    } else if (type === 'inspirations') {
      if (action === 'create') {
        data.inspirations.push(item);
      } else if (action === 'update') {
        data.inspirations = data.inspirations.map(i => i.id === item.id ? item : i);
      } else if (action === 'delete') {
        data.inspirations = data.inspirations.filter(i => i.id !== item.id);
      }
    }
    localStorageService.saveLocalData(data);
    return data;
  },

  exportData: () => {
    const user = localStorageService.getLocalUser();
    const data = localStorageService.getLocalData();
    return JSON.stringify({ user, data }, null, 2);
  },

  importData: (jsonString) => {
    try {
      const { user, data } = JSON.parse(jsonString);
      if (user && data) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  clearLocalUser: () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
};
