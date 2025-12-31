import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { config } from '../../config/env';
import { IFileStorageService } from '../../application/interfaces/services/file-storage.interface';

export class LocalFileStorageService implements IFileStorageService {
    private readonly uploadDir = 'uploads';

    constructor() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async save(params: { buffer: Buffer; mimeType: string; path?: string }): Promise<string> {
        const ext = params.mimeType.split('/')[1] || 'bin';
        const filename = `${randomUUID()}.${ext}`;
        const filepath = path.join(this.uploadDir, filename);

        await fs.promises.writeFile(filepath, params.buffer);

        const baseUrl = config.appBaseUrl || `http://localhost:${config.port}`;
        return `${baseUrl}/uploads/${filename}`;
    }
}
