// No storage interface needed as we're using the external Baltek API
// This file is kept minimal as per the requirements

export interface IStorage {
  // Placeholder interface - not used as we connect to external API
}

export class MemStorage implements IStorage {
  constructor() {
    // No-op - using external API
  }
}

export const storage = new MemStorage();
