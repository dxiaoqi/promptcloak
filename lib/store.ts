
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'payloads.json');

// Ensure DB exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}));
}

interface StoredPayload {
  id: string;
  content: string;
  createdAt: number;
}

export const db = {
  save: (content: string): string => {
    const id = randomUUID().slice(0, 8); // Short ID
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    
    data[id] = {
      id,
      content,
      createdAt: Date.now()
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return id;
  },

  get: (id: string): StoredPayload | null => {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      return data[id] || null;
    } catch (e) {
      return null;
    }
  }
};

