/**
 * IndexedDBAdapter
 * Non-blocking client database with automatic fallback to LocalStorage if IndexedDB is blocked.
 */
class IndexedDBAdapter extends StorageInterface {
  constructor(dbName = 'LexiSoupDB', version = 1) {
    super();
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.fallback = new LocalStorageAdapter();
    this.useFallback = false;
  }

  async init() {
    if (!window.indexedDB) {
      console.warn('[IndexedDBAdapter] IndexedDB not available, using LocalStorage fallback.');
      this.useFallback = true;
      return this.fallback.init();
    }

    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('keyval')) {
          db.createObjectStore('keyval');
        }
        if (!db.objectStoreNames.contains('vocabulary')) {
          db.createObjectStore('vocabulary', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(true);
      };

      request.onerror = (event) => {
        console.warn('[IndexedDBAdapter] Error initializing IndexedDB, falling back:', event);
        this.useFallback = true;
        resolve(this.fallback.init());
      };
    });
  }

  async get(key) {
    if (this.useFallback || !this.db) return this.fallback.get(key);

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('keyval', 'readonly');
        const store = tx.objectStore('keyval');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(this.fallback.get(key));
      } catch (err) {
        resolve(this.fallback.get(key));
      }
    });
  }

  async set(key, value) {
    if (this.useFallback || !this.db) return this.fallback.set(key, value);

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('keyval', 'readwrite');
        const store = tx.objectStore('keyval');
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(this.fallback.set(key, value));
      } catch (err) {
        resolve(this.fallback.set(key, value));
      }
    });
  }

  async getAll(storeName) {
    if (this.useFallback || !this.db) return this.fallback.getAll(storeName);

    return new Promise((resolve) => {
      try {
        if (!this.db.objectStoreNames.contains(storeName)) {
          return resolve(this.fallback.getAll(storeName));
        }
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(this.fallback.getAll(storeName));
      } catch (err) {
        resolve(this.fallback.getAll(storeName));
      }
    });
  }

  async saveAll(storeName, items) {
    if (this.useFallback || !this.db) return this.fallback.saveAll(storeName, items);

    return new Promise((resolve) => {
      try {
        if (!this.db.objectStoreNames.contains(storeName)) {
          return resolve(this.fallback.saveAll(storeName, items));
        }
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        items.forEach(item => store.put(item));
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(this.fallback.saveAll(storeName, items));
      } catch (err) {
        resolve(this.fallback.saveAll(storeName, items));
      }
    });
  }

  async clear() {
    if (this.useFallback || !this.db) return this.fallback.clear();
    // clear all stores
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(['keyval', 'vocabulary', 'sessions'], 'readwrite');
        tx.objectStore('keyval').clear();
        tx.objectStore('vocabulary').clear();
        tx.objectStore('sessions').clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(this.fallback.clear());
      }
    });
  }
}

window.IndexedDBAdapter = IndexedDBAdapter;
