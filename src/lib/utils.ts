import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Ensure the uploads directory exists
export function ensureUploadsDir() {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
} 