import fs from 'fs/promises';
import path from 'path';
import { storageIdFileName } from 'src/config';

export default class CurrentStorageIdStartup {
  static async get(): Promise<number> {
    let id = 1;
    try {
      id = parseInt(
        // file should be in the root directory
        (await fs.readFile(path.join('..', storageIdFileName), 'utf-8')).trim(),
        10,
      );
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    return id;
  }

  static async set(id: number): Promise<void> {
    await fs.writeFile(
      path.join('..', storageIdFileName),
      id.toString(),
      'utf-8',
    );
  }
}
