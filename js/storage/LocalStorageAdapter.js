/**
 * LocalStorageAdapter
 * High-performance synchronous localStorage implementation with error resilience.
 */
class LocalStorageAdapter extends StorageInterface {
  constructor(prefix = 'lexisoup_') {
    super();
    this.prefix = prefix;
  }

  async init() {
    return true;
  }

  async get(key) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn(`[LocalStorageAdapter] Read failed for key ${key}:`, e);
      return null;
    }
  }

  async set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[LocalStorageAdapter] Write failed for key ${key}:`, e);
      return false;
    }
  }

  async remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (e) {
      return false;
    }
  }

  async getAll(storeName) {
    return (await this.get(storeName)) || [];
  }

  async saveAll(storeName, items) {
    return await this.set(storeName, items);
  }

  async clear() {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(this.prefix)) {
        localStorage.removeItem(k);
      }
    });
    return true;
  }
}

window.LocalStorageAdapter = LocalStorageAdapter;
