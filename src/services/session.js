const USER_STORAGE_KEY = 'user';

export function getStoredUser() {
  try {
    const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return;
    }
    window.localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Ignore storage write failures and keep the in-memory session alive.
  }
}

export function clearStoredUser() {
  setStoredUser(null);
}
