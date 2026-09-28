/**
 * StorageInterface
 * Standardized contract for client-side persistence (IndexedDB / LocalStorage)
 */
class StorageInterface {
  async init() { throw new Error('Not implemented'); }
  async get(key) { throw new Error('Not implemented'); }
  async set(key, value) { throw new Error('Not implemented'); }
  async remove(key) { throw new Error('Not implemented'); }
  async getAll(storeName) { throw new Error('Not implemented'); }
  async saveAll(storeName, items) { throw new Error('Not implemented'); }
  async clear() { throw new Error('Not implemented'); }
}

window.StorageInterface = StorageInterface;
